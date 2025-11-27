import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "src/users/schema/user.schema";


export enum FollowStatus {
  // pending = 'pending',
  accepted = 'accepted',
  blocked = 'blocked',
}


@Schema({ timestamps: true })
export class Follow {

  // الشخص اللي عمل follow
  @Prop({ ref: User.name, required: true, type: Types.ObjectId })
  follower: Types.ObjectId

  // الشخص اللي اتعمل له follow
  @Prop({ ref: User.name, required: true, type: Types.ObjectId })
  following: Types.ObjectId

  @Prop({ enum: FollowStatus, default: FollowStatus.accepted })
  status: FollowStatus

  @Prop({ ref: User.name, type: Types.ObjectId, default: null })
  blocker: Types.ObjectId

  @Prop({ ref: User.name, type: Types.ObjectId, default: null })
  blocked: Types.ObjectId

}

export const FollowSchema = SchemaFactory.createForClass(Follow);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });