import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { APP } from '@app/common/consts';
import { join } from 'path';

const {
  AUTH: { AUTHENTICATION, GRANTS },
} = APP;

export const clientsModuleOptions: ClientsModuleOptions = [
  /**
   * Auth Services
   */
  {
    // Grant Service
    name: GRANTS.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      loader: { keepCase: true },
      package: GRANTS.PACKAGE.NAME,
      url: `0.0.0.0:${GRANTS.GRPC_PORT}`,
      protoPath: join(__dirname, 'protos/grants.proto'),
    },
  },
  {
    // Authentication Service
    name: AUTHENTICATION.PACKAGE.SYMBOL,
    transport: Transport.GRPC,
    options: {
      loader: { keepCase: true },
      package: AUTHENTICATION.PACKAGE.NAME,
      url: `0.0.0.0:${AUTHENTICATION.GRPC_PORT}`,
      protoPath: join(__dirname, 'protos/authentication.proto'),
    },
  },
];
