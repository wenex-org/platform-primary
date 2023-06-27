/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { SessionsModule } from './sessions.module';

async function bootstrap() {
  await repl(SessionsModule);
}
bootstrap();
