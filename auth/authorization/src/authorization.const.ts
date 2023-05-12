import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { APP } from '@app/common/consts';
import { join } from 'path';

const {
  AUTH: { GRANTS },
} = APP;

export const clientsModuleOptions: ClientsModuleOptions = [
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
];
