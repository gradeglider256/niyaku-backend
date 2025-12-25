import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditAssessmentService } from './credit_assessment.service';
import {
  CreateEmploymentHistoryDto,
  CreateSalaryHistoryDto,
  CreateCompanyEarningsDto,
} from './dto/credit-assessment.dto';
import { ResponseUtil } from '../common/utils/response.utils';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Profile } from '../user/entities/profile.entity';
import type { Request } from 'express';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';
import { Pagination } from '../common/decorators/pagination.decorator';

@Controller('credit-assessment')
@ApiTags('Credit Assessment')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
export class CreditAssessmentController {
  constructor(private readonly assessmentService: CreditAssessmentService) { }

  @Post('employment-history')
  @Permissions('assessment.manage')
  @ApiOperation({ summary: 'Add employment history for a client' })
  async createEmploymentHistory(
    @Body() dto: CreateEmploymentHistoryDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const branchID = user.branchID; // Default to user's branch
    console.log(user);
    // const rr = user.auth.roles.find(r=> r.)
    // if()
    const result = await this.assessmentService.createEmploymentHistory(
      dto,
      branchID,
    );
    return ResponseUtil.success(
      'Employment history added successfully',
      result,
    );
  }

  @Post('salary-history')
  @Permissions('assessment.manage')
  @ApiOperation({ summary: 'Add salary history' })
  async createSalaryHistory(@Body() dto: CreateSalaryHistoryDto) {
    const result = await this.assessmentService.createSalaryHistory(dto);
    return ResponseUtil.success('Salary history added successfully', result);
  }

  @Post('company-earnings')
  @Permissions('assessment.manage')
  @ApiOperation({ summary: 'Add company earnings (for business clients)' })
  async createCompanyEarnings(@Body() dto: CreateCompanyEarningsDto) {
    const result = await this.assessmentService.createCompanyEarnings(dto);
    return ResponseUtil.success('Company earnings added successfully', result);
  }

  @Post('assess/:clientId')
  @Permissions('assessment.perform')
  @ApiOperation({ summary: 'Perform automated credit assessment for a client' })
  async performAssessment(
    @Param('clientId') clientId: string,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const branchID = user.branchID;
    const result = await this.assessmentService.performAssessment(
      clientId,
      branchID,
      user.id,
    );
    return ResponseUtil.success(
      'Credit assessment performed successfully',
      result,
    );
  }

  @Get('history')
  @Permissions('assessment.read')
  @ApiOperation({ summary: 'Get assessment history with pagination' })
  @Pagination()
  async getAssessmentHistory(
    @Query() pagination: PaginationQueryWithBranchDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;

    if (
      pagination.branchId !== undefined &&
      pagination.branchId !== user.branchID
    ) {
      // Permission check for other branches (simplified for now)
      const userPermissions = user.auth.roles
        .flatMap((r) => r.role.permissions)
        .map((p) => p.permission.name);

      if (!userPermissions.includes('branch.read')) {
        throw new ForbiddenException(
          'Insufficient permissions to view assessments from other branches',
        );
      }
    } else {
      pagination.branchId = user.branchID;
    }

    const result =
      await this.assessmentService.getAssessmentHistory(pagination);
    return ResponseUtil.success(
      'Assessment history retrieved successfully',
      result,
    );
  }

  @Get(':id')
  @Permissions('assessment.read')
  @ApiOperation({ summary: 'Get assessment report by ID' })
  async getAssessmentById(@Param('id') id: string) {
    const result = await this.assessmentService.getAssessmentById(id);
    return ResponseUtil.success(
      'Assessment report retrieved successfully',
      result,
    );
  }
}
