import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SysConfigService } from './sys_config.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Profile } from '../user/entities/profile.entity';
import { ResponseUtil } from '../common/utils/response.utils';
import type { Request } from 'express';

@ApiTags('System Configuration')
@Controller('sys-config')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
export class SysConfigController {
  constructor(private readonly sysConfigService: SysConfigService) { }

  @Put('/:id')
  @Permissions('sys-config.update', 'sys-config.manage')
  @ApiOperation({ summary: 'Update branch loan settings' })
  async updateLoadSettings(
    @Param('id') id: string,
    @Body() updateData: any, // Use any or define a DTO
  ) {
    const branchID = parseInt(id, 10);
    const result = await this.sysConfigService.updateConfig(branchID, updateData);
    return ResponseUtil.success('Branch settings updated successfully', result);
  }

  @Get('/')
  @Permissions('sys-config.view')
  @ApiOperation({ summary: 'Get branch loan settings' })
  async getLoanSetting(
    @Query('branchId') queryBranchId: string,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    let branchID = user.branchID;

    if (queryBranchId) {
      const targetBranchID = parseInt(queryBranchId, 10);
      if (targetBranchID !== user.branchID) {
        // Check if user has overall branch management permissions
        const userPermissions = user.auth.roles
          .flatMap((r) => r.role.permissions)
          .map((p) => p.permission.name);

        if (!userPermissions.some(p => p === 'branch.view-branch' || p === 'branch.manage-branch')) {
          throw new ForbiddenException('Insufficient permissions to view other branch settings');
        }
        branchID = targetBranchID;
      }
    }

    const result = await this.sysConfigService.getConfigByBranch(branchID);
    return ResponseUtil.success('Branch settings retrieved successfully', result);
  }
}
