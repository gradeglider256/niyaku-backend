import { HttpStatus } from '@nestjs/common';
import {
  ErrorResponse,
  SuccessResponse,
} from '../interfaces/response.interface';
import { LoggerUtil } from './logger.util';

export class ResponseUtil {
  /**
   * Format success response
   */
  static success<T>(message: string, data?: T): SuccessResponse<T> {
    return {
      message,
      ...(data !== undefined && { data }),
    };
  }

  /**
   * Format error response
   */
  static error(code: number, error: string, message: string): ErrorResponse {
    return {
      code,
      error,
      message,
    };
  }

  /**
   * Format database error (generic message for security)
   */
  static databaseError(
    operation: 'create' | 'get' | 'update' | 'delete',
    entity: string,
    originalError: Error,
    module: string,
  ): ErrorResponse {
    // Log the actual error
    LoggerUtil.logError(originalError, module, {
      operation,
      entity,
    });

    // Return generic error to user
    return this.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `Failed to ${operation} ${entity}`,
      `An error occurred while processing your request`,
    );
  }

  /**
   * Format not found error
   */
  static notFound(entity: string, identifier?: string | number): ErrorResponse {
    const message = identifier
      ? `${entity} with identifier ${identifier} not found`
      : `${entity} not found`;

    return this.error(HttpStatus.NOT_FOUND, message, message);
  }

  /**
   * Format validation error
   */
  static validationError(message: string, details?: string): ErrorResponse {
    return this.error(
      HttpStatus.BAD_REQUEST,
      'Validation failed',
      details || message,
    );
  }

  /**
   * Format paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    pageSize: number,
    count: number,
    message: string = 'Data retrieved successfully',
  ): SuccessResponse<{ data: T[]; page: number; pageSize: number; count: number }> {
    return this.success(message, {
      data,
      page,
      pageSize,
      count,
    });
  }
}
