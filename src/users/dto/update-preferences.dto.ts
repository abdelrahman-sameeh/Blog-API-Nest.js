import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";



export class UpdatePreferencesDto{

  @IsOptional()
  @IsArray()
  @IsMongoId({each: true})
  @Type(() => Types.ObjectId)
  categories?: Types.ObjectId[]

  @IsOptional()
  @IsBoolean()
  random?: boolean


}