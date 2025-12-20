import { LoggerUtil } from '../utils/logger.util';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function TrackDbCall(module: string) {
  // List of sensitive methods that should not log arguments
  const SENSITIVE_METHODS = ['signin', 'signup', 'register', 'resetPassword', 'changePassword', 'addEmployee'];

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const result: unknown = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        // Don't log arguments for sensitive methods
        const isSensitive = SENSITIVE_METHODS.includes(propertyKey);
        const logMessage = isSensitive
          ? `${propertyKey}([REDACTED])`
          : `${propertyKey}(${JSON.stringify(args).substring(0, 100)})`;

        LoggerUtil.logDatabaseCall(logMessage, duration, module);

        return result;
      } catch (error) {
        const duration = Date.now() - start;

        // Don't log arguments for sensitive methods
        const isSensitive = SENSITIVE_METHODS.includes(propertyKey);
        const logMessage = isSensitive
          ? `${propertyKey}([REDACTED]) [FAILED]`
          : `${propertyKey}(${JSON.stringify(args).substring(0, 100)}) [FAILED]`;

        LoggerUtil.logDatabaseCall(logMessage, duration, module);

        throw error;
      }
    };

    return descriptor;
  };
}
