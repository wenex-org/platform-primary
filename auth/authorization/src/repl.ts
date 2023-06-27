/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { AuthorizationModule } from './authorization.module';

async function bootstrap() {
  await repl(AuthorizationModule);
}
bootstrap();
