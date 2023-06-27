/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { ConfigsModule } from './configs.module';

async function bootstrap() {
  await repl(ConfigsModule);
}
bootstrap();
