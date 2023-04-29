import { ArraySerializer } from '@app/common/serializers';
import { Exclude } from 'class-transformer';

import { GrantSerializer } from './grant.serializer';

@Exclude()
export class GrantsSerializer extends ArraySerializer<GrantSerializer> {
  static build(items: GrantSerializer[]): GrantsSerializer {
    return new GrantsSerializer({ items });
  }
}
