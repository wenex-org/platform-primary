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
import {
  CacheInterceptor,
  SetMetadataInterceptor,
} from '@app/common/interceptors';
import { GrantInterface, Metadata } from '@app/common/interfaces';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TotalSerializer } from '@app/common/serializers';
import { Observable, Subject, from, map } from 'rxjs';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Cache } from '@app/common/metadatas';

import { CreateGrantDto, UpdateGrantBulkDto, UpdateGrantOneDto } from './dto';
import { GrantSerializer, GrantsSerializer } from './serializers';
import { GrantsService } from './grants.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  SetMetadataInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class GrantsController {
  constructor(private readonly service: GrantsService) {}

  @GrpcMethod(GrantsService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service.count(filter).pipe(map((res) => ({ total: res })));
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateGrantDto,
  ): Observable<GrantSerializer> {
    return this.service.create(data, meta);
  }

  @Cache('grants', 'getter')
  @GrpcMethod(GrantsService.name)
  find(@Filter() filter: FilterDto): Observable<GrantsSerializer> {
    return this.service.find(filter).pipe(map((res) => ({ data: res })));
  }

  @GrpcMethod(GrantsService.name)
  cursor(@Filter() filter: FilterDto): Observable<GrantSerializer> {
    const subject = new Subject<GrantInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(value),
    });

    return subject.asObservable();
  }

  @Cache('grants', 'getter')
  @GrpcMethod(GrantsService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<GrantSerializer> {
    return this.service.findOne(filter);
  }

  @Cache('grants', 'getter')
  @GrpcMethod(GrantsService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<GrantSerializer> {
    return this.service.findById(filter);
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<GrantSerializer> {
    return this.service.deleteOne(filter, { meta });
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<GrantSerializer> {
    return this.service.deleteById(filter, { meta });
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<GrantSerializer> {
    return this.service.restoreOne(filter, { meta });
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<GrantSerializer> {
    return this.service.restoreById(filter, { meta });
  }

  @GrpcMethod(GrantsService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<GrantSerializer> {
    return this.service.destroyOne(filter);
  }

  @GrpcMethod(GrantsService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<GrantSerializer> {
    return this.service.destroyById(filter);
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateGrantOneDto,
  ): Observable<GrantSerializer> {
    return this.service.updateOne(data, filter, { meta });
  }

  @Cache('grants', 'flush')
  @GrpcMethod(GrantsService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateGrantBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(map((res) => ({ total: res })));
  }

  @Cache('grants', 'setter')
  @GrpcMethod(GrantsService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateGrantUniqueDto,
  ): Observable<GrantSerializer> {
    return this.service.updateById(data, filter, { meta });
  }
}
