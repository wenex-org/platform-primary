/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { GrantsModule } from './grants.module';

async function bootstrap() {
  await repl(GrantsModule);
}
bootstrap();
