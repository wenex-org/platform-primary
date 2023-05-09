import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NODE_ENV, SENTRY_DSN } from '@app/common/configs';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { HealthModule } from '@app/health';
import { Module } from '@nestjs/common';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationProvider } from './authentication.provider';
import { AuthenticationService } from './authentication.service';
import { clientsModuleOptions } from './authentication.const';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    PrometheusModule.register(),
    HealthModule.register(['disk', 'memory']),
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
