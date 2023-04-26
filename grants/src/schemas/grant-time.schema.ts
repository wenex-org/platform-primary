import { Prop } from '@typegoose/typegoose';

export class GrantTime {
  @Prop({ type: String, required: true })
  cron_exp: string;

  @Prop({ type: Number, required: true })
  duration: number;

  constructor(data?: Partial<GrantTime>) {
    if (data) Object.assign(this, data);
  }
}
