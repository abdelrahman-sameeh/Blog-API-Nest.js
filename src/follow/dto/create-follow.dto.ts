import { Transform, Type } from "class-transformer";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";



export class CreateFollowDto {

  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  following: Types.ObjectId;

}