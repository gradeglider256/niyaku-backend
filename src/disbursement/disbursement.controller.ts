import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DisbursementService } from './disbursement.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Profile } from '../user/entities/profile.entity';
import { ResponseUtil } from '../common/utils/response.utils';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import {
  CreateDisbursementDto,
  CreateLoanDto,
  DisbursementResponseDto,
  LoanResponseDto,
  UpdateDisbursementDto,
  UpdateLoanDto,
} from './dto/disbursement.dto';
import type { Request } from 'express';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';
import { Pagination } from '../common/decorators/pagination.decorator';

@ApiTags('disbursement')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('disbursement')
export class DisbursementController {
  constructor(private readonly disbursementService: DisbursementService) {}

  @Post('loan')
  @Permissions('loan.add')
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, type: LoanResponseDto })
  async createLoan(@Body() createLoanDto: CreateLoanDto, @Req() req: Request) {
    const user = req['user'] as Profile;
    const branchID = createLoanDto.branchID || user.branchID;

    if (createLoanDto.branchID && createLoanDto.branchID !== user.branchID) {
      this.checkBranchManagementPermission(user);
    }

    const loan = await this.disbursementService.createLoan(
      createLoanDto,
      branchID,
    );
    return ResponseUtil.success('Loan created successfully', loan);
  }

  @Get('loan/:id')
  @Permissions('loan.view')
  @ApiOperation({ summary: 'Get a loan by ID' })
  @ApiResponse({ status: 200, type: LoanResponseDto })
  async getLoan(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as Profile;
    const loan = await this.disbursementService.getLoan(id, user.branchID);
    return ResponseUtil.success('Loan retrieved successfully', loan);
  }

  @Get('loans')
  @Permissions('loan.view')
  @ApiOperation({ summary: 'Get all loans with pagination' })
  @Pagination()
  async getLoans(
    @Query() pagination: PaginationQueryWithBranchDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    if (pagination.branchId === undefined) {
      pagination.branchId = user.branchID;
    } else if (pagination.branchId !== user.branchID) {
      this.checkBranchManagementPermission(user);
    }

    const result = await this.disbursementService.getLoans(pagination);
    return ResponseUtil.success('Loans retrieved successfully', result);
  }

  @Put('loan/:id')
  @Permissions('loan.update')
  @ApiOperation({ summary: 'Update a loan' })
  @ApiResponse({ status: 200, type: LoanResponseDto })
  async updateLoan(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const loan = await this.disbursementService.updateLoan(
      id,
      updateLoanDto,
      user.branchID,
    );
    return ResponseUtil.success('Loan updated successfully', loan);
  }

  @Delete('loan/:id')
  @Permissions('loan.delete')
  @ApiOperation({ summary: 'Delete a loan' })
  async deleteLoan(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as Profile;
    await this.disbursementService.deleteLoan(id, user.branchID);
    return ResponseUtil.success('Loan deleted successfully');
  }

  @Post('loan/:id/approve')
  @Permissions('loan.approve')
  @ApiOperation({ summary: 'Approve a loan' })
  async approveLoan(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const loan = await this.disbursementService.updateLoan(
      id,
      { status: 'approved' },
      user.branchID,
    );
    return ResponseUtil.success('Loan approved successfully', loan);
  }

  @Post('loan/:id/reject')
  @Permissions('loan.reject')
  @ApiOperation({ summary: 'Reject a loan' })
  async rejectLoan(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as Profile;
    const loan = await this.disbursementService.updateLoan(
      id,
      { status: 'rejected' },
      user.branchID,
    );
    return ResponseUtil.success('Loan rejected successfully', loan);
  }

  // --- Disbursement Endpoints ---

  @Post()
  @Permissions('disbursement.add')
  @ApiOperation({ summary: 'Create a new disbursement' })
  @ApiResponse({ status: 201, type: DisbursementResponseDto })
  async createDisbursement(
    @Body() createDisbursementDto: CreateDisbursementDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const branchID = createDisbursementDto.branchID || user.branchID;

    if (
      createDisbursementDto.branchID &&
      createDisbursementDto.branchID !== user.branchID
    ) {
      this.checkBranchManagementPermission(user);
    }

    const disbursement = await this.disbursementService.createDisbursement(
      createDisbursementDto,
      branchID,
    );
    return ResponseUtil.success(
      'Disbursement created successfully',
      disbursement,
    );
  }

  @Get(':id')
  @Permissions('disbursement.view')
  @ApiOperation({ summary: 'Get a disbursement' })
  @ApiResponse({ status: 200, type: DisbursementResponseDto })
  async getDisbursement(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const disbursement = await this.disbursementService.getDisbursement(
      id,
      user.branchID,
    );
    return ResponseUtil.success(
      'Disbursement retrieved successfully',
      disbursement,
    );
  }

  @Get()
  @Permissions('disbursement.view')
  @ApiOperation({ summary: 'Get all disbursements with pagination' })
  @Pagination()
  async getDisbursements(
    @Query() pagination: PaginationQueryWithBranchDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    if (pagination.branchId === undefined) {
      pagination.branchId = user.branchID;
    } else if (pagination.branchId !== user.branchID) {
      this.checkBranchManagementPermission(user);
    }

    const result = await this.disbursementService.getDisbursements(pagination);
    return ResponseUtil.success('Disbursements retrieved successfully', result);
  }

  @Put(':id')
  @Permissions('disbursement.update')
  @ApiOperation({ summary: 'Update a disbursement' })
  @ApiResponse({ status: 200, type: DisbursementResponseDto })
  async updateDisbursement(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisbursementDto: UpdateDisbursementDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    const disbursement = await this.disbursementService.updateDisbursement(
      id,
      updateDisbursementDto,
      user.branchID,
    );
    return ResponseUtil.success(
      'Disbursement updated successfully',
      disbursement,
    );
  }

  @Delete(':id')
  @Permissions('disbursement.delete')
  @ApiOperation({ summary: 'Delete a disbursement' })
  async deleteDisbursement(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req['user'] as Profile;
    await this.disbursementService.deleteDisbursement(id, user.branchID);
    return ResponseUtil.success('Disbursement deleted successfully');
  }

  private checkBranchManagementPermission(user: Profile) {
    const userPermissions = user.auth.roles
      .flatMap((userRole) => userRole.role.permissions)
      .map((rolePerm) => rolePerm.permission.name);

    const hasBranchPermissions = userPermissions.some(
      (perm) =>
        perm === 'branch.view-branch' || perm === 'branch.manage-branch',
    );

    if (!hasBranchPermissions) {
      throw new ForbiddenException(
        'Insufficient permissions for cross-branch operations',
      );
    }
  }
}
