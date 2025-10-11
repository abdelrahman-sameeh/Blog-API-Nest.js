import { Transform, Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";


class BlockDto {
  @IsMongoId()
  _id: string;

  @IsNumber()
  @Type(() => Number)
  order: number;
}


export class UpdateArticleDto {
  @IsOptional()
  @IsMongoId()
  category?: Types.ObjectId;

  @IsOptional()
  @IsString()
  title?: string;

  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks?: BlockDto[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'You cannot provide more than 10 tags.' })
  @IsString({each: true, message: 'Each tag must be a string.' })
  @Type(() => String)
  @Transform(({ value }) => value.map((tag: string) => tag.trim().toLowerCase()))
  tags?: string[]
}




