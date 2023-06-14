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
  UpdateConfigUniqueDto,
} from '@app/common/dto';
import { ConfigInterface, Metadata } from '@app/common/interfaces';
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
  CreateConfigDto,
  UpdateConfigBulkDto,
  UpdateConfigOneDto,
} from './dto';
import { ConfigSerializer, ConfigsSerializer } from './serializers';
import { ConfigsService } from './configs.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ConfigsController {
  constructor(private readonly service: ConfigsService) {}

  @Cache('configs', 'fill')
  @GrpcMethod(ConfigsService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .create(data, meta)
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'fill')
  @GrpcMethod(ConfigsService.name)
  find(@Filter() filter: FilterDto): Observable<ConfigsSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(ConfigsSerializer, 'array'));
  }

  @GrpcMethod(ConfigsService.name)
  cursor(@Filter() filter: FilterDto): Observable<ConfigSerializer> {
    const subject = new Subject<ConfigInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(ConfigSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('configs', 'fill')
  @GrpcMethod(ConfigsService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<ConfigSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'fill')
  @GrpcMethod(ConfigsService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<ConfigSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<ConfigSerializer> {
    return this.service
      .destroyOne(filter)
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<ConfigSerializer> {
    return this.service
      .destroyById(filter)
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateConfigOneDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(ConfigSerializer));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateConfigBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('configs', 'flush')
  @GrpcMethod(ConfigsService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateConfigUniqueDto,
  ): Observable<ConfigSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(ConfigSerializer));
  }
}
