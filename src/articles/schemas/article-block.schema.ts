import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";


@Schema({ timestamps: true })
export class ArticleBlock {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Article', required: true })
  article: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  type: 'text' | 'image' | 'video' | 'code';

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  data: any;

  @Prop({ type: Number })
  order: number; 
}


export type ArticleBlockType = HydratedDocument<ArticleBlock>

export const ArticleBlockSchema = SchemaFactory.createForClass(ArticleBlock)

