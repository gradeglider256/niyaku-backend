import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityLogFilterDto } from '../dto/activity-log-filter.dto';

export interface CreateActivityLogDto {
  actionType: string;
  method: string;
  endpoint: string;
  userId?: string | null;
  userEmail?: string | null;
  userRoles?: string[] | null;
  branchID?: number | null;
  entityType?: string | null;
  entityId?: string | null;
  statusCode: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  /**
   * Create a new activity log entry
   */
  async createActivityLog(dto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      ...dto,
      timestamp: new Date(),
    });

    return await this.activityLogRepository.save(log);
  }

  /**
   * Get activity logs with pagination and filters
   */
  async getActivityLogs(filterDto: ActivityLogFilterDto) {
    const {
      page = 1,
      pageSize = 20,
      actionType,
      userId,
      userRoles,
      entityType,
      entityId,
      branchID,
      fromDate,
      toDate,
      statusCode,
      sortBy = 'timestamp',
      sortOrder = 'DESC',
    } = filterDto;

    const skip = (page - 1) * pageSize;
    const queryBuilder = this.activityLogRepository.createQueryBuilder('log');

    // Apply filters
    if (actionType) {
      queryBuilder.andWhere('log.actionType LIKE :actionType', {
        actionType: `%${actionType}%`,
      });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (userRoles) {
      const rolesArray = userRoles.split(',').map((r) => r.trim());
      // simple-array stores as comma-separated string, so we use LIKE for each role
      const roleConditions = rolesArray
        .map((role, index) => {
          queryBuilder.setParameter(`role${index}`, `%${role}%`);
          return `log.userRoles LIKE :role${index}`;
        })
        .join(' OR ');
      queryBuilder.andWhere(`(${roleConditions})`);
    }

    if (entityType) {
      queryBuilder.andWhere('log.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('log.entityId = :entityId', { entityId });
    }

    if (branchID) {
      queryBuilder.andWhere('log.branchID = :branchID', { branchID });
    }

    if (fromDate || toDate) {
      if (fromDate && toDate) {
        queryBuilder.andWhere('log.timestamp BETWEEN :fromDate AND :toDate', {
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
        });
      } else if (fromDate) {
        queryBuilder.andWhere('log.timestamp >= :fromDate', {
          fromDate: new Date(fromDate),
        });
      } else if (toDate) {
        queryBuilder.andWhere('log.timestamp <= :toDate', {
          toDate: new Date(toDate),
        });
      }
    }

    if (statusCode) {
      queryBuilder.andWhere('log.statusCode = :statusCode', { statusCode });
    }

    // Apply sorting
    const validSortFields = [
      'timestamp',
      'actionType',
      'entityType',
      'statusCode',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'timestamp';
    queryBuilder.orderBy(`log.${sortField}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const data = await queryBuilder.skip(skip).take(pageSize).getMany();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single activity log by ID
   */
  async getActivityLogById(id: string): Promise<ActivityLog | null> {
    return await this.activityLogRepository.findOne({
      where: { id },
      relations: ['user', 'branch'],
    });
  }
}
