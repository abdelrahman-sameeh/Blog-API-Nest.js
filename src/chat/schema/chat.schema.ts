import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Message } from './message.schema';

export type ChatDocument = Chat & Document;

export type StatusAction = 'active' | 'blocked' | 'reported';

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: [{ type: Types.ObjectId, ref: User.name }],
    required: true,
    index: true
  })
  members: Types.ObjectId[];

  @Prop({ unique: true })
  membersKey: string

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: User.name, default: null },
        action: { type: String, enum: ['active', 'blocked', 'reported'], default: 'active' },
      },
    ],
    default: [],
  })
  status: { user: Types.ObjectId | null; action: StatusAction }[];

  @Prop({
    type: Types.ObjectId,
    ref: Message.name,
    default: null,
  })
  lastMessage: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ['request', 'chat'],
    default: 'chat',
  })
  type: 'request' | 'chat';
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

