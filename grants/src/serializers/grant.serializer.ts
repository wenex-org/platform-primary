import { Exclude, Expose, Type } from 'class-transformer';
import { Action, Resource } from '@app/common/enums';
import { Serializer } from '@app/common/serializers';
import { ConvertModel } from '@app/common/utils';

import { TimeSerializer } from './time.serializer';
import type { Grant } from '../schemas';

@Exclude()
export class GrantSerializer extends Serializer<GrantSerializer> {
  @Expose()
  subject: string;

  @Expose()
  action: Action;

  @Expose()
  object: Resource;

  @Expose()
  field?: string[];

  @Expose()
  filter?: string[];

  @Expose()
  location?: string[];

  @Expose()
  @Type(() => TimeSerializer)
  times?: TimeSerializer[];

  static build(data: Grant): GrantSerializer {
    if (data.times?.length)
      data.times = data.times.map((time) => TimeSerializer.build(time));

    return new GrantSerializer(ConvertModel(data));
  }
}
