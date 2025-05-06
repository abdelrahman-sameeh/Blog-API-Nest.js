import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Base } from "./utils";
import { User } from "src/users/schema/user.schema";

@Schema({timestamps: true})
export class ResetCode extends Base{
  @Prop({ type: String })
  code: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User

  @Prop({ type: String })
  iv: string
}


export type ResetCodeType = HydratedDocument<ResetCode>;
export const resetCodeSchema = SchemaFactory.createForClass(ResetCode);

