import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { APP } from '@app/common/consts';
import { join } from 'path';

export const clientsModuleOptions: ClientsModuleOptions = [
  /**
   * Domain Services
   */
  {
    // App Service
    name: APP.DOMAIN.APPS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      package: APP.DOMAIN.APPS.PACKAGE.NAME,
      protoPath: join(__dirname, 'protos/apps.proto'),
    },
  },
  {
    // Client Service
    name: APP.DOMAIN.CLIENTS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      package: APP.DOMAIN.CLIENTS.PACKAGE.NAME,
      protoPath: join(__dirname, 'protos/clients.proto'),
    },
  },
  /**
   * Identity Services
   */
  {
    name: APP.IDENTITY.USERS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      // User Service
      package: APP.IDENTITY.USERS.PACKAGE.NAME,
      protoPath: join(__dirname, 'protos/users.proto'),
    },
  },
  {
    // Session Service
    name: APP.IDENTITY.SESSIONS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      package: APP.IDENTITY.SESSIONS.PACKAGE.NAME,
      protoPath: join(__dirname, 'protos/sessions.proto'),
    },
  },
];
