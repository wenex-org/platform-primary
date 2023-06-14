import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import {
  JWT_SECRET,
  NODE_ENV,
  REDIS_CONFIG,
  SENTRY_DSN,
} from '@app/common/configs';
import { ClientsModule } from '@nestjs/microservices';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { BlacklistedModule } from '@app/blacklisted';
import { HealthModule } from '@app/health';
import { RedisModule } from '@app/redis';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationProvider } from './authentication.provider';
import { AuthenticationService } from './authentication.service';
import { clientsModuleOptions } from './authentication.const';

@Module({
  imports: [
    BlacklistedModule,
    PrometheusModule.register(),
    RedisModule.register(REDIS_CONFIG()),
    HealthModule.register(['disk', 'memory']),
    JwtModule.register({ secret: JWT_SECRET() }),
    ClientsModule.register(clientsModuleOptions),
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
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthenticationProvider],
})
export class AuthenticationModule {}
