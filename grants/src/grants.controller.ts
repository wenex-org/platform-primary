import {
  GrpcMethod,
  GrpcService,
  GrpcStreamMethod,
} from '@nestjs/microservices';
import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
} from '@nestjs/common';
import { CountFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { CountSerializer } from '@app/common/serializers';
import { Observable, Subject, from } from 'rxjs';

import { CreateGrantDto, UpdateGrantBulkDto, UpdateGrantOneDto } from './dto';
import { GrantSerializer, GrantsSerializer } from './serializers';
import { GrantsService } from './grants.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class GrantsController {
  constructor(private readonly service: GrantsService) {}

  @GrpcMethod(GrantsService.name)
  async count(data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(GrantsService.name)
  async create(data: CreateGrantDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.create(data));
  }

  @GrpcStreamMethod()
  cursor(data: OneFilterDto): Observable<GrantSerializer> {
    const subject = new Subject<GrantSerializer>();

    from(this.service.cursor(data)).subscribe({
      next: (val) => subject.next(GrantSerializer.build(val)),
      complete: () => subject.complete(),
    });

    return subject.asObservable();
  }

  @GrpcMethod(GrantsService.name)
  async findOne(data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(GrantsService.name)
  async findMany(data: FilterDto): Promise<GrantsSerializer> {
    return GrantsSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(GrantsService.name)
  async findById(data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(GrantsService.name)
  async deleteById(data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(GrantsService.name)
  async restoreById(data: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(GrantsService.name)
  async updateById(data: UpdateGrantOneDto): Promise<GrantSerializer> {
    return GrantSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(GrantsService.name)
  async updateBulk(data: UpdateGrantBulkDto): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
