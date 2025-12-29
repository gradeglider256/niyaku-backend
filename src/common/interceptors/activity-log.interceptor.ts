/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activity-log.service';
import { ACTIVITY_TYPE_KEY } from '../decorators/activity-type.decorator';
import { Profile } from 'src/user/entities/profile.entity';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private activityLogService: ActivityLogService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Only intercept POST, PUT, PATCH, DELETE methods
    const method = request.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Extract request details
    const endpoint = request.url.split('?')[0];
    const user = request.user as Profile;
    const userId = user?.id || user?.auth?.id || null;
    const userEmail = user?.email || null;
    const userRoles = user?.auth?.roles
      ?.map((ur) => ur.role?.name)
      .filter(Boolean);
    const branchID = user?.branchID || null;

    // Extract IP address
    let ipAddress = request.ip;
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1') {
      const forwardedFor = request.headers['x-forwarded-for'];
      if (forwardedFor) {
        ipAddress = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(',')[0].trim();
      } else {
        const realIp = request.headers['x-real-ip'];
        if (realIp) {
          ipAddress = Array.isArray(realIp) ? realIp[0] : realIp;
        }
      }
    }

    const userAgent = request.headers['user-agent'] || null;

    // Get custom activity type from decorator or auto-detect
    const customActivityType = this.reflector.get<string>(
      ACTIVITY_TYPE_KEY,
      context.getHandler(),
    );
    const actionType =
      customActivityType || this.autoDetectActivityType(method, endpoint);

    // Extract entity type and ID
    const { entityType, entityId } = this.extractEntityInfo(endpoint, request);

    // Track status code
    let statusCode = 200;
    let responseData: any = null;

    return next.handle().pipe(
      tap({
        next: (data) => {
          statusCode = response.statusCode;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          responseData = data;
        },
        error: (error: any) => {
          if (error?.status) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            statusCode = error.status;
          } else if (error?.response?.statusCode) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            statusCode = error.response.statusCode;
          } else {
            statusCode = 500;
          }
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      finalize(async () => {
        try {
          // Extract entity ID from response if not found in request
          let finalEntityId = entityId;
          if (!finalEntityId && responseData) {
            finalEntityId = this.extractEntityIdFromResponse(responseData);
          }

          // Create activity log
          await this.activityLogService.createActivityLog({
            actionType,
            method,
            endpoint,
            userId,
            userEmail,
            userRoles,
            branchID,
            entityType,
            entityId: finalEntityId,
            statusCode,
            ipAddress,
            userAgent,
            metadata: {
              success: statusCode >= 200 && statusCode < 300,
            },
          });
        } catch (error) {
          // Log error but don't break the request
          console.error('Failed to create activity log:', error);
        }
      }),
    );
  }

  /**
   * Auto-detect activity type from HTTP method and endpoint
   */
  private autoDetectActivityType(method: string, endpoint: string): string {
    // Remove /api prefix
    const path = endpoint.replace(/^\/api\//, '');

    // Handle nested routes like /api/disbursement/loans/:id/approve
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) {
      return 'unknown.action';
    }

    // Pattern: POST /api/{resource} → {resource}.created
    if (method === 'POST' && parts.length === 1) {
      return `${this.singularize(parts[0])}.created`;
    }

    // Pattern: PUT/PATCH /api/{resource}/:id → {resource}.updated
    if ((method === 'PUT' || method === 'PATCH') && parts.length === 2) {
      return `${this.singularize(parts[0])}.updated`;
    }

    // Pattern: DELETE /api/{resource}/:id → {resource}.deleted
    if (method === 'DELETE' && parts.length === 2) {
      return `${this.singularize(parts[0])}.deleted`;
    }

    // Pattern: POST /api/{resource}/:id/{action} → {resource}.{action}
    if (method === 'POST' && parts.length === 3) {
      return `${this.singularize(parts[0])}.${parts[2]}`;
    }

    // Pattern: PATCH /api/{resource}/:id/{action} → {resource}.{action}
    if (method === 'PATCH' && parts.length === 3) {
      return `${this.singularize(parts[0])}.${parts[2]}`;
    }

    // Pattern: POST /api/{parent}/{resource}/:id/{action} → {resource}.{action}
    if (method === 'POST' && parts.length === 4) {
      return `${this.singularize(parts[1])}.${parts[3]}`;
    }

    // Pattern: POST /api/{parent}/:id/{action} → {parent}.{action}
    if (method === 'POST' && parts.length === 3) {
      return `${this.singularize(parts[0])}.${parts[2]}`;
    }

    // Default fallback
    return `${this.singularize(parts[0])}.${method.toLowerCase()}`;
  }

  /**
   * Extract entity type and ID from endpoint and request
   */
  private extractEntityInfo(
    endpoint: string,
    request: Request,
  ): { entityType: string | null; entityId: string | null } {
    const path = endpoint.replace(/^\/api\//, '');
    const parts = path.split('/').filter(Boolean);

    let entityType: string | null = null;
    let entityId: string | null = null;

    // Try to get entity ID from URL params
    if (request.params && Object.keys(request.params).length > 0) {
      const paramKeys = Object.keys(request.params);
      // Look for 'id' or similar patterns
      const idKey = paramKeys.find((k) => k.toLowerCase().includes('id'));
      if (idKey) {
        entityId = request.params[idKey];
      }
    }

    // Try to get entity ID from request body
    if (!entityId && request.body) {
      if (request.body.id) {
        entityId = String(request.body.id);
      } else if (request.body.clientID) {
        entityId = String(request.body.clientID);
      } else if (request.body.loanID) {
        entityId = String(request.body.loanID);
      }
    }

    // Extract entity type from endpoint
    if (parts.length > 0) {
      // Handle nested routes: /api/disbursement/loans -> Loan
      if (parts.length >= 2) {
        entityType = this.capitalize(this.singularize(parts[parts.length - 2]));
      } else {
        entityType = this.capitalize(this.singularize(parts[0]));
      }
    }

    return { entityType, entityId };
  }

  /**
   * Extract entity ID from response data
   */
  private extractEntityIdFromResponse(data: any): string | null {
    if (!data) return null;

    // Check if data has an id field
    if (data.id) {
      return String(data.id);
    }

    // Check if data.data has an id (wrapped response)
    if (data.data?.id) {
      return String(data.data.id);
    }

    return null;
  }

  /**
   * Convert plural to singular (simple version)
   */
  private singularize(word: string): string {
    // Simple rules - can be enhanced
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    }
    if (word.endsWith('es')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s')) {
      return word.slice(0, -1);
    }
    return word;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
