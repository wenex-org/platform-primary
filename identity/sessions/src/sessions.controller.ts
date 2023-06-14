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
  UpdateSessionUniqueDto,
} from '@app/common/dto';
import { SessionInterface, Metadata } from '@app/common/interfaces';
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

import {
  CreateSessionDto,
  UpdateSessionBulkDto,
  UpdateSessionOneDto,
} from './dto';
import { SessionSerializer, SessionsSerializer } from './serializers';
import { SessionsService } from './sessions.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Cache('sessions', 'fill')
  @GrpcMethod(SessionsService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateSessionDto,
  ): Observable<SessionSerializer> {
    return this.service
      .create(data, meta)
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'fill')
  @GrpcMethod(SessionsService.name)
  find(@Filter() filter: FilterDto): Observable<SessionsSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(SessionsSerializer, 'array'));
  }

  @GrpcMethod(SessionsService.name)
  cursor(@Filter() filter: FilterDto): Observable<SessionSerializer> {
    const subject = new Subject<SessionInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(SessionSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('sessions', 'fill')
  @GrpcMethod(SessionsService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<SessionSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'fill')
  @GrpcMethod(SessionsService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<SessionSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<SessionSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<SessionSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<SessionSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<SessionSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<SessionSerializer> {
    return this.service
      .destroyOne(filter)
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  destroyById(
    @Filter() filter: UniqueFilterDto,
  ): Observable<SessionSerializer> {
    return this.service
      .destroyById(filter)
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateSessionOneDto,
  ): Observable<SessionSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(SessionSerializer));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateSessionBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('sessions', 'flush')
  @GrpcMethod(SessionsService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateSessionUniqueDto,
  ): Observable<SessionSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(SessionSerializer));
  }
}
