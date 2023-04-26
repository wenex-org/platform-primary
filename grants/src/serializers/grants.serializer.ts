import { ConvertModel } from '@app/common/utils';
import { Exclude, Expose, Type } from 'class-transformer';

import type { GrantDocument } from '../schemas';
import { GrantSerializer } from './grant.serializer';

@Exclude()
export class GrantsSerializer {
  @Expose()
  @Type(() => GrantSerializer)
  items: GrantSerializer[];

  static build({ items }: { items: GrantDocument[] }): GrantsSerializer {
    return new GrantsSerializer({ items: items.map((item) => GrantSerializer.build(ConvertModel(item))) });
  }

  constructor(data?: GrantsSerializer) {
    if (data) Object.assign(this, data);
  }
}
