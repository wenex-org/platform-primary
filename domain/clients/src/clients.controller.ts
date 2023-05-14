import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CountFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { CountSerializer } from '@app/common/serializers';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';

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
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @GrpcMethod(ClientsService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(ClientsService.name)
  async create(@Body() data: CreateClientDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(ClientsService.name)
  cursor(@Body() data: FilterDto): Observable<ClientSerializer> {
    const subject = new Subject<ClientSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ClientSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ClientsService.name)
  async findOne(@Body() data: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(ClientsService.name)
  async findMany(@Body() data: FilterDto): Promise<ClientsSerializer> {
    return ClientsSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(ClientsService.name)
  async findById(@Body() data: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(ClientsService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(ClientsService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(ClientsService.name)
  async destroyById(@Body() data: OneFilterDto): Promise<ClientSerializer> {
    return ClientSerializer.build(await this.service.destroyById(data));
  }

  @GrpcMethod(ClientsService.name)
  async updateById(
    @Body() data: UpdateClientOneDto,
  ): Promise<ClientSerializer> {
    return ClientSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(ClientsService.name)
  async updateBulk(
    @Body() data: UpdateClientBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
