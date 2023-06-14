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
  UpdateAppUniqueDto,
} from '@app/common/dto';
import { AppInterface, Metadata } from '@app/common/interfaces';
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

import { CreateAppDto, UpdateAppBulkDto, UpdateAppOneDto } from './dto';
import { AppSerializer, AppsSerializer } from './serializers';
import { AppsService } from './apps.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class AppsController {
  constructor(private readonly service: AppsService) {}

  @Cache('apps', 'fill')
  @GrpcMethod(AppsService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateAppDto,
  ): Observable<AppSerializer> {
    return this.service.create(data, meta).pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'fill')
  @GrpcMethod(AppsService.name)
  find(@Filter() filter: FilterDto): Observable<AppsSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(AppsSerializer, 'array'));
  }

  @GrpcMethod(AppsService.name)
  cursor(@Filter() filter: FilterDto): Observable<AppSerializer> {
    const subject = new Subject<AppInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(AppSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('apps', 'fill')
  @GrpcMethod(AppsService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<AppSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'fill')
  @GrpcMethod(AppsService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<AppSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<AppSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<AppSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<AppSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<AppSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<AppSerializer> {
    return this.service.destroyOne(filter).pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<AppSerializer> {
    return this.service.destroyById(filter).pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateAppOneDto,
  ): Observable<AppSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(AppSerializer));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateAppBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('apps', 'flush')
  @GrpcMethod(AppsService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateAppUniqueDto,
  ): Observable<AppSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(AppSerializer));
  }
}
