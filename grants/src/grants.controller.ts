import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
} from '@nestjs/common';
import { TransformInterceptor } from '@app/common/interceptors';

import { GrantsService } from './grants.service';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { CountFilter } from '@app/common/types';
import { CountSerializer } from '@app/common/serializers';
import { CreateGrantDto } from './dto';

@GrpcService()
@UseInterceptors(TransformInterceptor, ClassSerializerInterceptor)
export class GrantsController {
  constructor(private readonly service: GrantsService) {}

  @GrpcMethod()
  async count(data: CountFilter<Document>): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod()
  async create(data: CreateGrantDto): Promise<Serializer> {
    return this.itemSerializer(await this.service.create(data));
  }

  @GrpcMethod()
  async findOne(data: OneFilter<Document>): Promise<Serializer> {
    return this.itemSerializer(await this.service.findOne(data));
  }

  @GrpcMethod()
  async findMany(
    data: Filter<Document, Schema>,
  ): Promise<{ items: Serializer[] }> {
    return this.itemsSerializer({ items: await this.service.findMany(data) });
  }

  @GrpcMethod()
  async findById(data: OneFilter<Document>): Promise<Serializer> {
    return this.itemSerializer(await this.service.findById(data));
  }

  @GrpcMethod()
  async deleteById(data: OneFilter<Document>): Promise<Serializer> {
    return this.itemSerializer(await this.service.deleteById(data));
  }

  @GrpcMethod()
  async restoreById(data: OneFilter<Document>): Promise<Serializer> {
    return this.itemSerializer(await this.service.restoreById(data));
  }

  @GrpcMethod()
  async updateById(data: {
    update: UpdateDto;
    filter: OneFilter<Document>;
  }): Promise<Serializer> {
    return this.itemSerializer(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod()
  async updateBulk(data: {
    update: UpdateDto;
    filter: OneFilter<Document>;
  }): Promise<TotalSerializer> {
    return TotalSerializer.build({
      count: await this.service.updateBulk(data.filter, data.update),
    });
  }
}
