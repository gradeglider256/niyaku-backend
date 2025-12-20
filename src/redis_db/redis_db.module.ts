import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const password = configService.get<string>('REDIS_PASSWORD');
        const host = configService.get<string>('REDIS_HOST') ?? 'localhost';
        const port = configService.get<number>('REDIS_PORT') ?? 6379;
        const redisUrl = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;

        const keyv = new Keyv({
          store: new KeyvRedis(redisUrl),
        });

        return {
          store: keyv,
          ttl: 600000, // 10 minutes in milliseconds
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisDbModule {}
