/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { ClientsModule } from './clients.module';

async function bootstrap() {
  await repl(ClientsModule);
}
bootstrap();
