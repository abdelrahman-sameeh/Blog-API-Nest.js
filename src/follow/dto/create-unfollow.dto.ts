import { Transform } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class CreateUnfollowDto {
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  following: Types.ObjectId;
}