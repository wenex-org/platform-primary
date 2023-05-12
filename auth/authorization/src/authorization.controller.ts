import { GrpcMethod, GrpcService } from '@nestjs/microservices';

import { AuthorizationService } from './authorization.service';
import { AuthorizationSerializer } from './serializers';
import { AuthorizationDto } from './dto';

@GrpcService()
export class AuthorizationController {
  constructor(private readonly service: AuthorizationService) {}

  @GrpcMethod(AuthorizationService.name)
  async can(auth: AuthorizationDto): Promise<AuthorizationSerializer> {
    return AuthorizationSerializer.build(await this.service.can(auth));
  }
}
