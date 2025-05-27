import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";




@Schema({timestamps: true})
export class Category{

  @Prop()
  title: string

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

export type CategoryType = HydratedDocument<Category>
export const CategorySchema = SchemaFactory.createForClass(Category)

