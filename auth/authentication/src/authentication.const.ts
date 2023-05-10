import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { APP } from '@app/common/consts';
import { join } from 'path';

const {
  DOMAIN: { APPS, CLIENTS },
  IDENTITY: { USERS, SESSIONS },
} = APP;

export const clientsModuleOptions: ClientsModuleOptions = [
  /**
   * Domain Services
   */
  {
    // App Service
    name: APPS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      loader: { keepCase: true },
      package: APPS.PACKAGE.NAME,
      url: `0.0.0.0:${APPS.GRPC_PORT}`,
      protoPath: join(__dirname, 'protos/apps.proto'),
    },
  },
  {
    // Client Service
    name: CLIENTS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      loader: { keepCase: true },
      package: CLIENTS.PACKAGE.NAME,
      url: `0.0.0.0:${CLIENTS.GRPC_PORT}`,
      protoPath: join(__dirname, 'protos/clients.proto'),
    },
  },
  /**
   * Identity Services
   */
  {
    // User Service
    name: USERS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      loader: { keepCase: true },
      package: USERS.PACKAGE.NAME,
      url: `0.0.0.0:${USERS.GRPC_PORT}`,
      protoPath: join(__dirname, 'protos/users.proto'),
    },
  },
  {
    // Session Service
    name: SESSIONS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      loader: { keepCase: true },
      package: SESSIONS.PACKAGE.NAME,
      url: `0.0.0.0:${SESSIONS.GRPC_PORT}`,
      protoPath: join(__dirname, 'protos/sessions.proto'),
    },
  },
];
