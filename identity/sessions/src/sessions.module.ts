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

import { SessionsController } from './sessions.controller';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';
import { Session, SessionSchema } from './schemas';

@Module({
  imports: [
    PrometheusModule.register(),
    RedisModule.register(REDIS_CONFIG()),
    MongooseModule.forRoot(MONGO_CONFIG()),
    HealthModule.register(['disk', 'memory', 'mongo']),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
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
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepository],
})
export class SessionsModule {}
