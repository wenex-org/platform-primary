import {
  MONGO_CONFIG,
  NODE_ENV,
  REDIS_CONFIG,
  SENTRY_DSN,
} from '@app/common/configs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from '@app/health';
import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';

import { ConfigsController } from './configs.controller';
import { ConfigsRepository } from './configs.repository';
import { ConfigsService } from './configs.service';
import { Config, ConfigSchema } from './schemas';

@Module({
  imports: [
    PrometheusModule.register(),
    RedisModule.register(REDIS_CONFIG()),
    MongooseModule.forRoot(MONGO_CONFIG()),
    HealthModule.register(['disk', 'memory', 'mongo']),
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    SentryModule.forRoot({
      debug: NODE_ENV().IS_DEVELOPMENT,
      dsn: NODE_ENV().IS_DEVELOPMENT ? undefined : SENTRY_DSN(),
      environment: NODE_ENV().IS_DEVELOPMENT ? 'dev' : 'production',
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      release: process.env.npm_package_version,
      tracesSampleRate: 1.0,
      maxBreadcrumbs: 10,
    }),
  ],
  controllers: [ConfigsController],
  providers: [ConfigsService, ConfigsRepository],
})
export class ConfigsModule {}
