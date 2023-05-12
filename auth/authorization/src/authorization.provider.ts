import { AuthenticationService, GrantsService } from '@app/common/interfaces';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { APP } from '@app/common/consts';

const {
  AUTH: { AUTHENTICATION, GRANTS },
} = APP;

@Injectable()
export class AuthorizationProvider implements OnModuleInit {
  public grants: GrantsService;
  public authentication: AuthenticationService;

  constructor(
    @Inject(GRANTS.PACKAGE.SYMBOL) protected grantsClient: ClientGrpc,
    @Inject(AUTHENTICATION.PACKAGE.SYMBOL)
    protected authenticationClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grants = this.grantsClient.getService<GrantsService>(
      GRANTS.SERVICE.NAME,
    );

    this.authentication =
      this.authenticationClient.getService<AuthenticationService>(
        AUTHENTICATION.SERVICE.NAME,
      );
  }
}
