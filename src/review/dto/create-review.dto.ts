import { IsMongoId, IsString } from "class-validator"
import { Types } from "mongoose"

export class CreateReviewDto {

  @IsMongoId()
  article: Types.ObjectId

  @IsString()
  content: string

}

