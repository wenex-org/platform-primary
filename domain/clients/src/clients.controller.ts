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
  UpdateClientUniqueDto,
} from '@app/common/dto';
import { ClientInterface, Metadata } from '@app/common/interfaces';
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
  CreateClientDto,
  UpdateClientBulkDto,
  UpdateClientOneDto,
} from './dto';
import { ClientSerializer, ClientsSerializer } from './serializers';
import { ClientsService } from './clients.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Cache('clients', 'fill')
  @GrpcMethod(ClientsService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateClientDto,
  ): Observable<ClientSerializer> {
    return this.service
      .create(data, meta)
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'fill')
  @GrpcMethod(ClientsService.name)
  find(@Filter() filter: FilterDto): Observable<ClientsSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(ClientsSerializer, 'array'));
  }

  @GrpcMethod(ClientsService.name)
  cursor(@Filter() filter: FilterDto): Observable<ClientSerializer> {
    const subject = new Subject<ClientInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(ClientSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('clients', 'fill')
  @GrpcMethod(ClientsService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<ClientSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'fill')
  @GrpcMethod(ClientsService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<ClientSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<ClientSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<ClientSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<ClientSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<ClientSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<ClientSerializer> {
    return this.service
      .destroyOne(filter)
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  destroyById(@Filter() filter: UniqueFilterDto): Observable<ClientSerializer> {
    return this.service
      .destroyById(filter)
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateClientOneDto,
  ): Observable<ClientSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(ClientSerializer));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateClientBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('clients', 'flush')
  @GrpcMethod(ClientsService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateClientUniqueDto,
  ): Observable<ClientSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(ClientSerializer));
  }
}
