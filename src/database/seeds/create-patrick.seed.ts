import { DataSource } from 'typeorm';
import { Profile } from '../../user/entities/profile.entity';
import { Auth } from '../../user/entities/auth.entity';
import { UserRole } from '../../user/entities/user.role.entity';
import { Role } from '../../user/entities/role.entity';
import { Permission } from '../../user/entities/permission.entity';
import { RolePermissions } from '../../user/entities/role.permission.entity';
import { Branch } from '../../user/entities/branch.entity';
import * as bcrypt from 'bcrypt';

export class CreatePatrickSeed {
  async run(dataSource: DataSource): Promise<void> {
    const manager = dataSource.manager;

    const email = 'patrick.aikonia@gmail.com';
    const id = '12345678901234'; // 14 chars
    const password = 'testPassword';

    // Create or get branch
    let branch = await manager.findOne(Branch, {
      where: { name: 'Kampala - Tirupati Mazimall' },
    });
    if (!branch) {
      branch = manager.create(Branch, {
        name: 'Kampala - Tirupati Mazimall',
        isHeadOffice: 'true',
        countryName: 'Uganda',
        countryCode: 'UG',
        address: 'titupati mazima mall',
      });
      await manager.save(Branch, branch);
      console.log('Kampala branch created');
    }

    // Check if exists
    let profile = await manager.findOne(Profile, { where: { email } });
    if (!profile) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create Auth
      const auth = manager.create(Auth, {
        id: id,
        password: hashedPassword,
        salt: salt,
        isTemporaryPassword: true,
        emailVerificationCode: '',
        emailVerificationInitAt: new Date().toISOString(),
        emailVerifiedAt: new Date().toISOString(),
        mobileVerificationCode: '',
        mobileVerificationInitAt: new Date().toISOString(),
        mobileVerifiedAt: new Date().toISOString(),
        recoveryCode: '',
        recoveryCodeInitAt: new Date().toISOString(),
        recoveryCodeUsedAt: new Date().toISOString(),
      });
      await manager.save(Auth, auth);

      // Create Profile
      profile = manager.create(Profile, {
        id: id,
        firstName: 'Patrick',
        lastName: 'Aikonia',
        middleName: '',
        email: email,
        mobileNumber: '1234567890',
        address: '123 Main St',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        branchID: branch.id,
        dateHired: new Date().toISOString(),
        profile: 'default',
      });
      await manager.save(Profile, profile);
      console.log('Patrick user created');
    } else {
      console.log('Patrick user already exists');
    }

    // Assign Role (assuming a role exists, e.g., 'admin' or create one)
    // For now, let's try to find an 'admin' role or create it
    let adminRole = await manager.findOne(Role, { where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = manager.create(Role, {
        name: 'admin',
        description: 'Administrator',
        level: 'global',
      });
      await manager.save(Role, adminRole);
    }

    // Assign all permissions to admin role
    const permissions = await manager.find(Permission); // Assuming permissions are already seeded or we can seed them here too if needed, but better to rely on PermissionsSeed running first or check
    // Actually, let's just fetch the ones we need for this test: employee.add-employee
    // But PermissionsSeed should run first.
    // Let's assume PermissionsSeed runs first.

    for (const perm of permissions) {
      const existingRolePerm = await manager.findOne(RolePermissions, {
        where: { roleID: adminRole.id, permissionID: perm.id },
      });
      if (!existingRolePerm) {
        const rolePerm = manager.create(RolePermissions, {
          roleID: adminRole.id,
          permissionID: perm.id,
        });
        await manager.save(RolePermissions, rolePerm);
      }
    }

    const existingUserRole = await manager.findOne(UserRole, {
      where: { userID: id, roleID: adminRole.id },
    });

    if (!existingUserRole) {
      const userRole = manager.create(UserRole, {
        userID: id,
        roleID: adminRole.id,
      });
      await manager.save(UserRole, userRole);
      console.log('Admin role assigned to Patrick');
    } else {
      console.log('Patrick already has admin role');
    }

    console.log('Patrick seed completed successfully');
  }
}
