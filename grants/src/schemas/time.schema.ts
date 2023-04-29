import { SubSchema } from '@app/common/schemas';
import { Prop } from '@typegoose/typegoose';

export class Time extends SubSchema<Time> {
  @Prop({ type: String, required: true })
  cron_exp: string;

  @Prop({ type: Number, required: true })
  duration: number;
}
