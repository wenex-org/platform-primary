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

import { CreateGrantDto, UpdateGrantBulkDto, UpdateGrantOneDto } from './dto';
import { GrantSerializer, GrantsSerializer } from './serializers';
import { GrantsService } from './grants.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class GrantsController {
  constructor(private readonly service: GrantsService) {}

  @GrpcMethod(GrantsService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(GrantsService.name)
  async create(@Body() data: CreateGrantDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(GrantsService.name)
  cursor(@Body() data: FilterDto): Observable<GrantSerializer> {
    const subject = new Subject<GrantSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(GrantSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(GrantsService.name)
  async findOne(@Body() data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(GrantsService.name)
  async findMany(@Body() data: FilterDto): Promise<GrantsSerializer> {
    return GrantsSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(GrantsService.name)
  async findById(@Body() data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(GrantsService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(GrantsService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(GrantsService.name)
  async updateById(@Body() data: UpdateGrantOneDto): Promise<GrantSerializer> {
    return GrantSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(GrantsService.name)
  async updateBulk(@Body() data: UpdateGrantBulkDto): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
