import { ArraySerializer } from '@app/common/serializers';
import { Exclude } from 'class-transformer';

import { GrantSerializer } from './grant.serializer';
import { Grant } from '../schemas';

@Exclude()
export class GrantsSerializer extends ArraySerializer<GrantSerializer> {
  static build(items: Grant[]): GrantsSerializer {
    return new GrantsSerializer({
      items: items.map((i) => GrantSerializer.build(i)),
    });
  }
}
