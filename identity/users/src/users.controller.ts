import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  QueryFilterDto,
  FilterDto,
  OneFilterDto,
  UniqueFilterDto,
  UpdateUserUniqueDto,
} from '@app/common/dto';
import { UserInterface, Metadata } from '@app/common/interfaces';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { mapToInstance, toInstance } from '@app/common/utils';
import { CacheInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TotalSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Cache } from '@app/common/metadatas';

import { CreateUserDto, UpdateUserBulkDto, UpdateUserOneDto } from './dto';
import { UserSerializer, UsersSerializer } from './serializers';
import { UsersService } from './users.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Cache('users', 'fill')
  @GrpcMethod(UsersService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateUserDto,
  ): Observable<UserSerializer> {
    return this.service.create(data, meta).pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'fill')
  @GrpcMethod(UsersService.name)
  find(@Filter() filter: FilterDto): Observable<UsersSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(UsersSerializer, 'array'));
  }

  @GrpcMethod(UsersService.name)
  cursor(@Filter() filter: FilterDto): Observable<UserSerializer> {
    const subject = new Subject<UserInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(UserSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('users', 'fill')
  @GrpcMethod(UsersService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<UserSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'fill')
  @GrpcMethod(UsersService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<UserSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<UserSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<UserSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<UserSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<UserSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<UserSerializer> {
    return this.service.destroyOne(filter).pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<UserSerializer> {
    return this.service.destroyById(filter).pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateUserOneDto,
  ): Observable<UserSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(UserSerializer));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateUserBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('users', 'flush')
  @GrpcMethod(UsersService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateUserUniqueDto,
  ): Observable<UserSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(UserSerializer));
  }
}
