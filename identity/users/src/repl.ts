/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { UsersModule } from './users.module';

async function bootstrap() {
  await repl(UsersModule);
}
bootstrap();
