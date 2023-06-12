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
  UpdateGrantUniqueDto,
} from '@app/common/dto';
import { GrantInterface, Metadata } from '@app/common/interfaces';
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

import { CreateGrantDto, UpdateGrantBulkDto, UpdateGrantOneDto } from './dto';
import { GrantSerializer, GrantsSerializer } from './serializers';
import { GrantsService } from './grants.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class GrantsController {
  constructor(private readonly service: GrantsService) {}

  @Cache('grants', 'fill')
  @GrpcMethod(GrantsService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateGrantDto,
  ): Observable<GrantSerializer> {
    return this.service.create(data, meta).pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'fill')
  @GrpcMethod(GrantsService.name)
  find(@Filter() filter: FilterDto): Observable<GrantsSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(GrantsSerializer, 'array'));
  }

  @GrpcMethod(GrantsService.name)
  cursor(@Filter() filter: FilterDto): Observable<GrantSerializer> {
    const subject = new Subject<GrantInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(GrantSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('grants', 'fill')
  @GrpcMethod(GrantsService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<GrantSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'fill')
  @GrpcMethod(GrantsService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<GrantSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<GrantSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<GrantSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<GrantSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<GrantSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<GrantSerializer> {
    return this.service.destroyOne(filter).pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<GrantSerializer> {
    return this.service
      .destroyById(filter)
      .pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateGrantOneDto,
  ): Observable<GrantSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(GrantSerializer));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateGrantBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateGrantUniqueDto,
  ): Observable<GrantSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(GrantSerializer));
  }
}
