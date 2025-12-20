import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { Auth } from './entities/auth.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user.role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermissions } from './entities/role.permission.entity';
import { Branch } from './entities/branch.entity';
import { SignInDto } from './dto/signin.dto';
import { ChangeProfileDto } from './dto/profile.dto';
import { AddRoleDto, RemoveRoleDto, CreateRoleDto } from './dto/role.dto';
import { CreateBranchDto } from './dto/branch.dto';
import * as bcrypt from 'bcrypt';
import { AddEmployeeDTO } from './dto/add.employee.dto';
import { TrackDbCall } from '../common/decorators/track-db-call.decorator';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly notificationService: NotificationService,
  ) {}

  @TrackDbCall('UserModule')
  async signin(dto: SignInDto) {
    // Find profile with all relations
    const profile = await this.entityManager.findOne(Profile, {
      where: { email: dto.email },
      relations: [
        'auth',
        'auth.roles',
        'auth.roles.role',
        'auth.roles.role.permissions',
        'auth.roles.role.permissions.permission',
      ],
    });

    if (!profile || !profile.auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fetch the password separately since it has select: false
    const authWithPassword = await this.entityManager
      .createQueryBuilder(Auth, 'auth')
      .where('auth.id = :id', { id: profile.auth.id })
      .addSelect('auth.password')
      .addSelect('auth.salt')
      .getOne();
    if (!authWithPassword || !authWithPassword.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(
      dto.password,
      authWithPassword.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    return {
      id: profile.auth.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      middleName: profile.middleName,
      roles: profile.auth.roles?.map((ur) => ur.role),
    };
  }

  @TrackDbCall('UserModule')
  async getProfile(userId: string) {
    const profile = await this.entityManager.findOne(Profile, {
      where: { id: userId },
      relations: [
        'auth',
        'auth.roles',
        'auth.roles.role',
        'auth.roles.role.permissions',
        'auth.roles.role.permissions.permission',
      ],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  @TrackDbCall('UserModule')
  async updateProfile(userId: string, dto: ChangeProfileDto) {
    const profile = await this.entityManager.findOne(Profile, {
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    Object.assign(profile, dto);
    return await this.entityManager.save(Profile, profile);
  }

  @TrackDbCall('UserModule')
  async addRoleToUser(dto: AddRoleDto) {
    return await this.entityManager.transaction(async (manager) => {
      const user = await manager.findOne(Auth, { where: { id: dto.userID } });
      if (!user) throw new NotFoundException('User not found');

      for (const roleId of dto.roleIDs) {
        const role = await manager.findOne(Role, {
          where: { id: String(roleId) },
        });
        if (!role) throw new NotFoundException(`Role ${roleId} not found`);

        const existing = await manager.findOne(UserRole, {
          where: { userID: dto.userID, roleID: String(roleId) },
        });

        if (!existing) {
          const userRole = manager.create(UserRole, {
            userID: dto.userID,
            roleID: String(roleId),
          });
          await manager.save(UserRole, userRole);
        }
      }

      return await this.getProfile(dto.userID);
    });
  }

  @TrackDbCall('UserModule')
  async removeRoleFromUser(dto: RemoveRoleDto) {
    return await this.entityManager.transaction(async (manager) => {
      const user = await manager.findOne(Auth, { where: { id: dto.userID } });
      if (!user) throw new NotFoundException('User not found');

      for (const roleId of dto.roleIDs) {
        await manager.delete(UserRole, {
          userID: dto.userID,
          roleID: String(roleId),
        });
      }

      return await this.getProfile(dto.userID);
    });
  }

  @TrackDbCall('UserModule')
  async getRoles(page: number = 1, pageSize: number = 25) {
    const skip = (page - 1) * pageSize;

    const query = this.entityManager
      .createQueryBuilder(Role, 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission')
      .skip(skip)
      .take(pageSize);

    const [data, count] = await query.getManyAndCount();

    return { data, count, page, pageSize };
  }

  @TrackDbCall('UserModule')
  async createRole(dto: CreateRoleDto) {
    return await this.entityManager.transaction(async (manager) => {
      const role = manager.create(Role, {
        name: dto.roleName,
      });
      const savedRole = await manager.save(Role, role);

      for (const permId of dto.permissionIDs) {
        const perm = await manager.findOne(Permission, {
          where: { id: permId },
        });
        if (!perm)
          throw new BadRequestException(`Permission ${permId} not found`);

        const rolePerm = manager.create(RolePermissions, {
          roleID: savedRole.id,
          permissionID: perm.id,
        });
        await manager.save(RolePermissions, rolePerm);
      }
      return savedRole;
    });
  }

  @TrackDbCall('UserModule')
  async deleteRole(id: string) {
    const role = await this.entityManager.findOne(Role, { where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    await this.entityManager.delete(Role, id);
    return role;
  }

  @TrackDbCall('UserModule')
  async addEmployee(dto: AddEmployeeDTO) {
    if (dto.id.length !== 14) {
      throw new BadRequestException('ID must be 14 characters long');
    }

    return await this.entityManager.transaction(async (manager) => {
      // Check if user already exists
      const existingProfile = await manager.findOne(Profile, {
        where: { id: dto.id },
      });
      if (existingProfile) {
        throw new BadRequestException('User with this ID already exists');
      }

      const existingEmail = await manager.findOne(Profile, {
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('User with this email already exists');
      }

      // Generate random password
      const temporaryPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

      // Create Auth entity
      const auth = manager.create(Auth, {
        id: dto.id,
        password: hashedPassword,
        salt: salt,
        isTemporaryPassword: true,
        emailVerificationCode: '',
        emailVerificationInitAt: new Date().toISOString(),
        emailVerifiedAt: new Date().toISOString(), // Auto-verify for employees added by admin? Or leave unverified? Assuming verified for now as admin added them.
        mobileVerificationCode: '',
        mobileVerificationInitAt: new Date().toISOString(),
        mobileVerifiedAt: new Date().toISOString(),
        recoveryCode: '',
        recoveryCodeInitAt: new Date().toISOString(),
        recoveryCodeUsedAt: new Date().toISOString(),
      });
      await manager.save(Auth, auth);

      // Create Profile entity
      const profile = manager.create(Profile, {
        id: dto.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName || '',
        email: dto.email,
        mobileNumber: dto.mobileNumber,
        address: dto.address,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        branchID: dto.branchID,
        dateHired: dto.dateHired,
        profile: 'default', // Placeholder as per entity definition
      });
      await manager.save(Profile, profile);

      // Assign Roles
      for (const roleId of dto.roles) {
        const userRole = manager.create(UserRole, {
          userID: dto.id,
          roleID: String(roleId), // Assuming roleID is string in DB but number in DTO
        });
        await manager.save(UserRole, userRole);
      }

      // Send Welcome Email
      if (dto.email) {
        await this.notificationService.sendWelcomeEmail(
          dto.email,
          `${dto.firstName} ${dto.lastName}`,
          temporaryPassword,
        );
      }

      return { message: 'Employee added successfully', userId: dto.id };
    });
  }

  @TrackDbCall('UserModule')
  async getEmployees(
    page: number = 1,
    pageSize: number = 25,
    branchId?: number,
  ) {
    const skip = (page - 1) * pageSize;
    const query = this.entityManager
      .createQueryBuilder(Profile, 'profile')
      .skip(skip)
      .take(pageSize);

    if (branchId) {
      query.where('profile.branchID = :branchId', { branchId });
    }

    const [data, count] = await query.getManyAndCount();
    return { count, page, pageSize, data };
  }

  @TrackDbCall('UserModule')
  async getEmployeeDetails(id: string) {
    const profile = await this.entityManager.findOne(Profile, {
      where: { id },
      relations: ['auth', 'auth.roles', 'auth.roles.role'],
    });
    if (!profile) throw new NotFoundException('Employee not found');
    return profile;
  }

  @TrackDbCall('UserModule')
  async createBranch(dto: CreateBranchDto) {
    const branch = this.entityManager.create(Branch, dto);
    return await this.entityManager.save(Branch, branch);
  }

  @TrackDbCall('UserModule')
  async getBranches(page: number = 1, pageSize: number = 25) {
    const [data, count] = await this.entityManager.findAndCount(Branch, {
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { count, page, pageSize, data };
  }
}
