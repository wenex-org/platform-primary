import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CountFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { MetadataBindInterceptor } from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { CountSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

import { CreateUserDto, UpdateUserBulkDto, UpdateUserOneDto } from './dto';
import { UserSerializer, UsersSerializer } from './serializers';
import { UsersService } from './users.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @GrpcMethod(UsersService.name)
  async count(@Filter() filter: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(UsersService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateUserDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(UsersService.name)
  cursor(@Filter() filter: FilterDto): Observable<UserSerializer> {
    const subject = new Subject<UserSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(UserSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(UsersService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(UsersService.name)
  async findMany(@Filter() filter: FilterDto): Promise<UsersSerializer> {
    return UsersSerializer.build(await this.service.findMany(filter));
  }

  @GrpcMethod(UsersService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(UsersService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(UsersService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.restoreById(filter, meta));
  }

  @GrpcMethod(UsersService.name)
  async destroyById(@Filter() filter: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(UsersService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateUserOneDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(UsersService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateUserBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
