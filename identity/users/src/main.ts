/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
require('log-node')();

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NODE_ENV } from '@app/common/configs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { initTracing } from 'tracing';
import { join } from 'path';

import { UsersModule } from './users.module';

const {
  IDENTITY: { USERS },
} = APP;

async function bootstrap() {
  if (NODE_ENV().IS_PRODUCTION) await initTracing(['http', 'grpc']);

  const app = await NestFactory.create(UsersModule, { cors: true });

  const rpcUrl = `0.0.0.0:${USERS.GRPC_PORT}`;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: rpcUrl,
      loader: { keepCase: true },
      package: USERS.PACKAGE.NAME,
      protoPath: join(__dirname, 'users.proto'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(USERS.API_PORT);

  const url = await app.getUrl();
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`Users RPC Micro Successfully Started on ${rpcUrl}`);
}
bootstrap();
