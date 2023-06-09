import {
  AppsService,
  ClientsService,
  SessionsService,
  UsersService,
} from '@app/common/interfaces';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { APP } from '@app/common/consts';

const {
  DOMAIN: { APPS, CLIENTS },
  IDENTITY: { USERS, SESSIONS },
} = APP;

@Injectable()
export class AuthenticationProvider implements OnModuleInit {
  public apps: AppsService;
  public clients: ClientsService;

  public users: UsersService;
  public sessions: SessionsService;

  constructor(
    // Domain Clients
    @Inject(APPS.PACKAGE.SYMBOL) protected appsClient: ClientGrpc,
    @Inject(CLIENTS.PACKAGE.SYMBOL) protected clientsClient: ClientGrpc,

    // Identity Clients
    @Inject(USERS.PACKAGE.SYMBOL) protected usersClient: ClientGrpc,
    @Inject(SESSIONS.PACKAGE.SYMBOL) protected sessionsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    // Domain Clients
    this.apps = this.appsClient.getService<AppsService>(APPS.SERVICE.NAME);
    this.clients = this.clientsClient.getService<ClientsService>(
      CLIENTS.SERVICE.NAME,
    );

    // Identity Clients
    this.users = this.usersClient.getService<UsersService>(USERS.SERVICE.NAME);
    this.sessions = this.sessionsClient.getService<SessionsService>(
      SESSIONS.SERVICE.NAME,
    );
  }
}
