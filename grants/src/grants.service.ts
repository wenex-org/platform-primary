import { Injectable } from '@nestjs/common';

@Injectable()
export class GrantsService {
  getHello(): string {
    return 'Hello World!';
  }
}
