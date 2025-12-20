import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto } from './dto/signin.dto';
import { ChangeProfileDto } from './dto/profile.dto';
import { AddRoleDto, RemoveRoleDto, CreateRoleDto } from './dto/role.dto';
import { CreateBranchDto } from './dto/branch.dto';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AddEmployeeDTO } from './dto/add.employee.dto';
import { ResponseUtil } from '../common/utils/response.utils';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ApiResponse, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller()
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  @Post('auth/signin')
  @ApiResponse({ status: 200, description: 'Signin successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Body() dto: SignInDto) {
    const user = await this.userService.signin(dto);
    const payload = { sub: user.id, email: user.email };
    console.log(payload);
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // Example refresh token

    return ResponseUtil.success('Signin successful', {
      accessToken,
      refreshToken,
      user,
    });
  }

  @Get('auth/verify-email')
  @ApiResponse({ status: 200, description: 'Email verification not implemented yet' })
  verifyEmail() {
    return ResponseUtil.success('Email verification not implemented yet');
  }

  @Get('auth/profile')
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProfile(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = req['user'] as any;
    const profile = await this.userService.getProfile(user.id);
    return ResponseUtil.success('Profile retrieved', profile);
  }

  @Put('auth/profile')
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changeProfile(@Req() req: Request, @Body() dto: ChangeProfileDto) {
    const user = req['user'] as any;
    const updated = await this.userService.updateProfile(user.id, dto);
    return ResponseUtil.success('Profile updated', updated);
  }

  @Put('auth/roles/remove')
  @ApiResponse({ status: 200, description: 'Role removed' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeRoleFromUser(@Body() dto: RemoveRoleDto) {
    const updated = await this.userService.removeRoleFromUser(dto);
    return ResponseUtil.success('Role removed', updated);
  }

  @Put('auth/roles/add')
  @ApiResponse({ status: 200, description: 'Role added' })
  @ApiResponse({ status: 400, description: 'Invalid role' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addRoleToUser(@Body() dto: AddRoleDto) {
    const updated = await this.userService.addRoleToUser(dto);
    return ResponseUtil.success('Role added', updated);
  }

  @Post('auth/roles')
  @ApiResponse({ status: 200, description: 'Role created' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createNewRole(@Body() dto: CreateRoleDto) {
    const role = await this.userService.createRole(dto);
    return ResponseUtil.success('Role created', role);
  }

  @Delete('auth/role/:id')
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteRole(@Param('id') id: string) {
    const role = await this.userService.deleteRole(id);
    return ResponseUtil.success('Role deleted', role);
  }

  @Delete('employees/:id')
  terminateEmployee() {
    return ResponseUtil.success('Not implemented');
  }

  @Post('employees')
  @UseGuards(PermissionsGuard)
  @Permissions('employee.add-employee', 'employee.manage-employee')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addEmployee(@Body() dto: AddEmployeeDTO) {
    const result = await this.userService.addEmployee(dto);
    return ResponseUtil.success('Employee added', result);
  }

  @Get('employees')
  @Permissions('employee.view-employee')
  @ApiOperation({ summary: 'Get employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEmployees(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 25,
    @Query('branch_id') branchId?: number,
  ) {
    const result = await this.userService.getEmployees(page, pageSize, branchId);
    return ResponseUtil.success('Employees retrieved', result);
  }

  @Get('employees/:id')
  @Permissions('employee.view-employee', 'employee.manage-employee')
  @ApiOperation({ summary: 'Get employee details' })
  @ApiResponse({ status: 200, description: 'Employee details retrieved' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEmployeeDetails(@Param('id') id: string) {
    const result = await this.userService.getEmployeeDetails(id);
    return ResponseUtil.success('Employee details retrieved', result);
  }

  @Post('branch')
  @Permissions('branch.add-branch', 'branch.manage-branch')
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createBranch(@Body() dto: CreateBranchDto) {
    const result = await this.userService.createBranch(dto);
    return ResponseUtil.success('Branch created', result);
  }

  @Get('branch')
  @Permissions('branch.view-branch', 'branch.manage-branch')
  @ApiOperation({ summary: 'Get branches' })
  @ApiResponse({ status: 200, description: 'Branches retrieved' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBranches(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 25,
  ) {
    const result = await this.userService.getBranches(page, pageSize);
    return ResponseUtil.success('Branches retrieved', result);
  }
}
