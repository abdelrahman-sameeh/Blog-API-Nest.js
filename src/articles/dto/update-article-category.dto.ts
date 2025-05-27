import { IsMongoId } from "class-validator";
import mongoose from "mongoose";



export class UpdateArticleCategoryDto{
  @IsMongoId()
  category: mongoose.Types.ObjectId
}


