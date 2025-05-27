import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";


@Schema({ timestamps: true })
export class Article {

  @Prop(String)
  title: string

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Category', required: true })
  category: mongoose.Types.ObjectId

  @Prop([String])
  tags: string[]

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}


export type ArticleType = HydratedDocument<Article>
export const ArticleSchema = SchemaFactory.createForClass(Article)



