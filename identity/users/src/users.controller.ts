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
} from '@app/common/dto';
import {
  CacheInterceptor,
  SetMetadataInterceptor,
} from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TotalSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { Observable, Subject, from, map } from 'rxjs';
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@app/common/interfaces';

import { CreateUserDto, UpdateUserBulkDto, UpdateUserOneDto } from './dto';
import { UserSerializer, UsersSerializer } from './serializers';
import { UsersService } from './users.service';
import { Cache } from '@app/common/metadatas';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  SetMetadataInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @GrpcMethod(UsersService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service.count(filter).pipe(map((res) => ({ total: res })));
  }

  @Cache('users', 'setter')
  @GrpcMethod(UsersService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateUserDto,
  ): Observable<UserSerializer> {
    return this.service.create(data, { meta });
  }

  @GrpcMethod(UsersService.name)
  cursor(@Filter() filter: FilterDto): Observable<UserSerializer> {
    const subject = new Subject<UserSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(value),
    });

    return subject.asObservable();
  }

  @Cache('users', 'getter')
  @GrpcMethod(UsersService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<UserSerializer> {
    return this.service.findOne(filter);
  }

  @Cache('users', 'getter')
  @GrpcMethod(UsersService.name)
  find(@Filter() filter: FilterDto): Observable<UsersSerializer> {
    return this.service.find(filter).pipe(map((res) => ({ data: res })));
  }

  @Cache('users', 'getter')
  @GrpcMethod(UsersService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<UserSerializer> {
    return this.service.findById(filter);
  }

  @Cache('users', 'setter')
  @GrpcMethod(UsersService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<UserSerializer> {
    return this.service.deleteById(filter, { meta });
  }

  @Cache('users', 'setter')
  @GrpcMethod(UsersService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<UserSerializer> {
    return this.service.restoreById(filter, { meta });
  }

  @Cache('users', 'setter')
  @GrpcMethod(UsersService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<UserSerializer> {
    return this.service.destroyById(filter);
  }

  @GrpcMethod(UsersService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateUserOneDto,
  ): Observable<UserSerializer> {
    return this.service.updateById(filter, update, meta);
  }

  @GrpcMethod(UsersService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateUserBulkDto,
  ): Observable<TotalSerializer> {
    return TotalSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
