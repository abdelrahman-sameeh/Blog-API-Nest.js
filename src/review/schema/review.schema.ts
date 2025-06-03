import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Article } from "src/articles/schemas/article.schema";
import { User } from "src/users/schema/user.schema";

@Schema({ timestamps: true })
export class Review extends Document {

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author: Types.ObjectId
  
  @Prop({ type: String, required: true, trim: true })
  content: string

  @Prop({ type: Types.ObjectId, ref: Article.name, required: false })
  article?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Review.name })
  parentReview?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  likes: Types.ObjectId[]
}



export const ReviewSchema = SchemaFactory.createForClass(Review)
