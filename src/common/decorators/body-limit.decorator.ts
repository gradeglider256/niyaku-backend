// src/common/decorators/body-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const BODY_LIMIT_KEY = 'bodyLimit';
export const BodyLimit = (limit: string) => SetMetadata(BODY_LIMIT_KEY, limit);