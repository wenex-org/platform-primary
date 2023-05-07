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
  CreateSessionDto,
  UpdateSessionBulkDto,
  UpdateSessionOneDto,
} from './dto';
import { SessionSerializer, SessionsSerializer } from './serializers';
import { SessionsService } from './sessions.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @GrpcMethod(SessionsService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(SessionsService.name)
  async create(@Body() data: CreateSessionDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(SessionsService.name)
  cursor(@Body() data: FilterDto): Observable<SessionSerializer> {
    const subject = new Subject<SessionSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(SessionSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(SessionsService.name)
  async findOne(@Body() data: OneFilterDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(SessionsService.name)
  async findMany(@Body() data: FilterDto): Promise<SessionsSerializer> {
    return SessionsSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(SessionsService.name)
  async findById(@Body() data: OneFilterDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(SessionsService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(SessionsService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(SessionsService.name)
  async updateById(
    @Body() data: UpdateSessionOneDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(SessionsService.name)
  async updateBulk(
    @Body() data: UpdateSessionBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
