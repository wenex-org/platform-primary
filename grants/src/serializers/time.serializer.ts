import { SubSerializer } from '@app/common/serializers';
import { Exclude, Expose } from 'class-transformer';
import { ConvertModel } from '@app/common/utils';

import type { Time } from '../schemas';

@Exclude()
export class TimeSerializer extends SubSerializer<TimeSerializer> {
  @Expose()
  cron_exp: string;

  @Expose()
  duration: number;

  static build(data: Time): TimeSerializer {
    return new TimeSerializer(ConvertModel(data));
  }
}
