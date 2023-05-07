/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
require('log-node')();

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NODE_ENV } from '@app/common/configs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { initTracing } from 'tracing';
import { join } from 'path';

import { ClientsModule } from './clients.module';

async function bootstrap() {
  if (NODE_ENV().IS_PRODUCTION) await initTracing(['http', 'grpc']);

  const app = await NestFactory.create(ClientsModule, { cors: true });

  const rpcUrl = `0.0.0.0:${APP.DOMAIN.CLIENTS.GRPC_PORT}`;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: rpcUrl,
      package: 'clients',
      loader: { keepCase: true },
      protoPath: join(__dirname, 'clients.proto'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(APP.DOMAIN.CLIENTS.API_PORT);

  const url = await app.getUrl();
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`Clients RPC Micro Successfully Started on ${rpcUrl}`);
}
bootstrap();
