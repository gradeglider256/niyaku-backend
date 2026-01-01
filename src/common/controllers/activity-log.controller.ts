import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ActivityLogService } from '../services/activity-log.service';
import { ActivityLogFilterDto } from '../dto/activity-log-filter.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { ResponseUtil } from '../utils/response.utils';

@Controller('activity-logs')
@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) { }

  @Get()
  @Permissions('activity_logs.read')
  @ApiOperation({ summary: 'Get activity logs with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getActivityLogs(@Query() filterDto: ActivityLogFilterDto) {
    const result = await this.activityLogService.getActivityLogs(filterDto);
    return ResponseUtil.paginated(
      result.data,
      result.page,
      result.pageSize,
      result.total,
      'Activity logs retrieved successfully',
    );
  }

  @Get(':id')
  @Permissions('activity_logs.read')
  @ApiOperation({ summary: 'Get a single activity log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity log retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Activity log not found' })
  async getActivityLogById(@Param('id') id: string) {
    const log = await this.activityLogService.getActivityLogById(id);
    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }
    return ResponseUtil.success('Activity log retrieved successfully', log);
  }
}
