import { Transform, Type } from "class-transformer";
import { IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";



export class CreateReportDto{

  @IsMongoId()
  reason: Types.ObjectId;

  @IsOptional()
  description?: string;


}