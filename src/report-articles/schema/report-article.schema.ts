import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Article } from "../../articles/schemas/article.schema";
import { User } from "src/users/schema/user.schema";
import { ReportReason } from "./report-reason.schema";

export enum Status {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

@Schema({ timestamps: true })
export class ReportArticle extends Document {

  @Prop({ ref: Article.name, required: true, type: Types.ObjectId })
  article: Types.ObjectId;

  @Prop({ ref: User.name, required: true, type: Types.ObjectId })
  reporter: Types.ObjectId;

  @Prop({ ref: ReportReason.name, type: Types.ObjectId, required: true })
  reason: Types.ObjectId;

  @Prop()
  description?: string

  @Prop({ type: String, enum: Status, default: Status.pending })
  status: Status;

}

export const ReportArticleSchema = SchemaFactory.createForClass(ReportArticle);





