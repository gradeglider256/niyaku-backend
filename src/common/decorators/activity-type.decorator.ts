import { SetMetadata } from '@nestjs/common';

export const ACTIVITY_TYPE_KEY = 'activity_type';

/**
 * Decorator to override auto-detected activity type
 * @param activityType - Custom activity type (e.g., 'client.registered')
 */
export const ActivityType = (activityType: string) =>
  SetMetadata(ACTIVITY_TYPE_KEY, activityType);
