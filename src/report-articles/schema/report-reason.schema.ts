import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



@Schema()
export class ReportReason extends Document {
  @Prop({ required: true, unique: true, trim: true })
  reason: string
}


export const ReportReasonSchema = SchemaFactory.createForClass(ReportReason);

