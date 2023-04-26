import { Action, Resource } from '@app/common/enums';
import { Serializer } from '@app/common/serializers';
import { ConvertModel } from '@app/common/utils';
import { Exclude, Expose, Type } from 'class-transformer';

import type { GrantDocument } from '../schemas';
import { GrantTime } from '../schemas/grant-time.schema';

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
  @Type(() => GrantTime)
  time?: GrantTime[];

  static build(data: GrantDocument): GrantSerializer {
    return new GrantSerializer(ConvertModel(data));
  }
}
