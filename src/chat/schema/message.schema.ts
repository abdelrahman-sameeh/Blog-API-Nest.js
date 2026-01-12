import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "src/users/schema/user.schema";
import { Chat } from "./chat.schema";
import { Types } from "mongoose";


export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';

export type MessageDeleteType = 'soft' | 'hard';


@Schema({ timestamps: true })
export class Message {

  @Prop({ type: Types.ObjectId, required: true, ref: 'Chat', index: true })
  chat: Types.ObjectId;

  @Prop({ ref: User.name, type: Types.ObjectId, required: true })
  sender: Types.ObjectId;

  @Prop({ required: true, maxLength: 1000 })
  content: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'video', 'file', 'voice', 'system'],
    default: 'text',
  })
  type: MessageType;

  @Prop({
    type: [{ type: Types.ObjectId, ref: User.name }],
    default: [],
  })
  seenBy: Types.ObjectId[];


  @Prop({
    type: Types.ObjectId,
    ref: Message.name,
    default: null,
  })
  replyTo: Types.ObjectId | null;


  @Prop({
    type: [{
      user: { type: Types.ObjectId, ref: User.name },
      deleteType: {
        type: String,
        enum: ['forAll', 'forOnlyMe'],
      },
    },],
    default: [],
  })
  deletedFor: {
    user: Types.ObjectId;
    deleteType: MessageDeleteType;
  }[];

}


export const MessageSchema = SchemaFactory.createForClass(Message);
