import { applyDecorators, Type as NestType } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function Pagination<T extends object = any>(dto?: NestType<T>) {
  const decorators = [
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      example: 20,
    }),
  ];

  if (dto) {
    // Extra fields from extended DTOs (e.g. branchId)
    decorators.push(
      ApiQuery({ name: 'branchId', required: false, type: Number }),
    );
  }

  return applyDecorators(...decorators);
}
