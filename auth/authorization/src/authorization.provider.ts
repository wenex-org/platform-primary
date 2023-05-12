import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { GrantsService } from '@app/common/interfaces';
import { ClientGrpc } from '@nestjs/microservices';
import { APP } from '@app/common/consts';

const {
  AUTH: { GRANTS },
} = APP;

@Injectable()
export class AuthorizationProvider implements OnModuleInit {
  public grants: GrantsService;

  constructor(
    @Inject(GRANTS.PACKAGE.SYMBOL) protected grantsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grants = this.grantsClient.getService<GrantsService>(
      GRANTS.SERVICE.NAME,
    );
  }
}
