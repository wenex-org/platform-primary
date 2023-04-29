import { SubSchema } from '@app/common/schemas';
import { Prop } from '@typegoose/typegoose';

export class GrantTime extends SubSchema<GrantTime> {
  @Prop({ type: String, required: true })
  cron_exp: string;

  @Prop({ type: Number, required: true })
  duration: number;
}
