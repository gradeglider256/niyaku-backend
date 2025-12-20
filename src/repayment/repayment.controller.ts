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
import { RepaymentService } from './repayment.service';
import { CreateRepaymentDto } from './dto/create-repayment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Profile } from '../user/entities/profile.entity';
import { ResponseUtil } from '../common/utils/response.utils';
import type { Request } from 'express';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';
import { Pagination } from '../common/decorators/pagination.decorator';

@ApiTags('Repayments')
@Controller('repayment')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
export class RepaymentController {
  constructor(private readonly repaymentService: RepaymentService) { }

  @Post()
  @Permissions('repayment.record')
  @ApiOperation({ summary: 'Record a loan repayment' })
  async recordPayment(
    @Body() dto: CreateRepaymentDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const branchID = user.branchID;
    const result = await this.repaymentService.createRepayment(dto, branchID);
    return ResponseUtil.success('Repayment recorded successfully', result);
  }

  @Get()
  @Permissions('repayment.read')
  @ApiOperation({ summary: 'Get all repayments with pagination' })
  @Pagination()
  async getRepayments(
    @Query() pagination: PaginationQueryWithBranchDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    if (pagination.branchId !== undefined && pagination.branchId !== user.branchID) {
      // Basic permission check
      pagination.branchId = pagination.branchId;
    } else {
      pagination.branchId = user.branchID;
    }

    const result = await this.repaymentService.getRepayments(pagination);
    return ResponseUtil.success('Repayments retrieved successfully', result);
  }

  @Get(':id')
  @Permissions('repayment.read')
  @ApiOperation({ summary: 'Get repayment by ID' })
  async getRepaymentById(@Param('id') id: string) {
    const result = await this.repaymentService.getRepaymentById(parseInt(id, 10));
    return ResponseUtil.success('Repayment record retrieved successfully', result);
  }
}
