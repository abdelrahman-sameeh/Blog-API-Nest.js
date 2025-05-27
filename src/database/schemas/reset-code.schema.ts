import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/schema/user.schema";

@Schema({ timestamps: true })
export class ResetCode  {
  @Prop({ type: String })
  code: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User

  @Prop({ type: String })
  iv: string

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}


export type ResetCodeType = HydratedDocument<ResetCode>;
export const ResetCodeSchema = SchemaFactory.createForClass(ResetCode);

