/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
require('log-node')();

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { join } from 'path';

import { GrantsModule } from './grants.module';

async function bootstrap() {
  const app = await NestFactory.create(GrantsModule, { cors: true });

  app.useGlobalInterceptors(new SentryInterceptor());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'grants',
      loader: { keepCase: true },
      url: `0.0.0.0:${APP.GRANTS.GRPC_PORT}`,
      protoPath: join(__dirname, 'grants.proto'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(APP.GRANTS.API_PORT);

  const url = await app.getUrl();
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log('Grants (gRPC, Kafka) Microservice Successfully Started.');
}
bootstrap();
