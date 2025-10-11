import { IsMongoId, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateReplyDto 
{
  @IsMongoId()
  reviewId: Types.ObjectId;

  @IsString()
  content: string;
}
