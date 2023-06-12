import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { QueryFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { MetadataBindInterceptor } from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { CountSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

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
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @GrpcMethod(ClientsService.name)
  async count(@Filter() filter: QueryFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(ClientsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateClientDto,
  ): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(ClientsService.name)
  cursor(@Filter() filter: FilterDto): Observable<ClientSerializer> {
    const subject = new Subject<ClientSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ClientSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ClientsService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(ClientsService.name)
  async findMany(@Filter() filter: FilterDto): Promise<ClientsSerializer> {
    return ClientsSerializer.build(await this.service.findMany(filter));
  }

  @GrpcMethod(ClientsService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(ClientsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(ClientsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.restoreById(filter, meta));
  }

  @GrpcMethod(ClientsService.name)
  async destroyById(@Filter() filter: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(ClientsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateClientOneDto,
  ): Promise<ClientSerializer> {
    return ClientSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(ClientsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateClientBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
