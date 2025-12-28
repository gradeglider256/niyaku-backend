import {
    Controller,
    Get,
    Query,
    UseGuards,
    HttpStatus,
    HttpCode,
    ParseDatePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseUtil } from '../common/utils/response.utils';
import { DashboardDto } from './dto/dashboard.dto';
import { AnalyticsDto } from './dto/analytics.dto';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    @Permissions('reports.read')
    @ApiOperation({ summary: 'Get dashboard data including metrics and charts' })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for data range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for data range (YYYY-MM-DD)',
    })
    @HttpCode(HttpStatus.OK)
    async getDashboard(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const data = await this.reportsService.getDashboardData(start, end);
        return ResponseUtil.success('Dashboard data retrieved successfully', data);
    }

    @Get('analytics')
    @Permissions('reports.read')
    @ApiOperation({ summary: 'Get reports analytics including YTD metrics, loan performance, and collection data' })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for data range (YYYY-MM-DD), defaults to January 1 of current year',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for data range (YYYY-MM-DD), defaults to current date',
    })
    @HttpCode(HttpStatus.OK)
    async getAnalytics(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const data = await this.reportsService.getAnalyticsData(start, end);
        return ResponseUtil.success('Analytics data retrieved successfully', data);
    }
}
