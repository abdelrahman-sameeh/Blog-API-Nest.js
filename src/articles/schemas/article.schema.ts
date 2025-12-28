import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Category } from "src/categories/schema/category.schema";
import { ArticleVisibility } from "src/common/enums/article-visibility.enum";
import { Tag } from "src/tags/schema/tag.schema";
import { User } from "src/users/schema/user.schema";


@Schema({ timestamps: true })
export class Article {

  @Prop({type: String, trim: true})
  title: string

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  category: Types.ObjectId

  @Prop({ type: [{ type: Types.ObjectId, ref: Tag.name }] })
  tags: Types.ObjectId[]

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  likes: Types.ObjectId[]

  @Prop({ enum: ArticleVisibility, default: ArticleVisibility.PUBLIC })
  visibility: ArticleVisibility

}

export type ArticleType = HydratedDocument<Article>
export const ArticleSchema = SchemaFactory.createForClass(Article)



