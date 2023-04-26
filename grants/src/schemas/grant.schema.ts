import { buildSchema, Prop } from '@typegoose/typegoose';
import { Action, Resource } from '@app/common/enums';
import { Schema } from '@app/common/schemas';
import type { Document } from 'mongoose';

import { GrantTime } from './grant-time.schema';

export class Grant extends Schema<Grant> {
  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, enum: Action, required: true })
  action: Action;

  @Prop({ type: String, enum: Resource, required: true })
  object: Resource;

  @Prop({ type: [String], required: false })
  field?: string[];

  @Prop({ type: [String], required: false })
  filter?: string[];

  @Prop({ type: [String], required: false })
  location?: string[];

  @Prop({ type: [GrantTime], required: false })
  time?: GrantTime[];
}

export type GrantDocument = Document & Grant;
export const GrantSchema = buildSchema(Grant);
