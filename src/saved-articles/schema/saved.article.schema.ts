import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";


@Schema({ timestamps: true })
export class SavedArticle extends Document {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Article', required: true })
  article: Types.ObjectId

}


export const SavedArticleSchema = SchemaFactory.createForClass(SavedArticle)

