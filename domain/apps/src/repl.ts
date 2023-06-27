/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { AppsModule } from './apps.module';

async function bootstrap() {
  await repl(AppsModule);
}
bootstrap();
