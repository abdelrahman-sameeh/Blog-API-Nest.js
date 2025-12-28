import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "src/users/schema/user.schema";



@Schema({ timestamps: true })
export class FriendRequest extends Document {
  @Prop({ ref: User.name, required: true, type: Types.ObjectId })
  sender: Types.ObjectId

  @Prop({ ref: User.name, required: true, type: Types.ObjectId })
  receiver: Types.ObjectId
}


export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
