import { Transform, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";




export class UpdateArticleTagsDto {

  @IsArray()
  @ArrayMinSize(1, { message: 'You must provide at least 1 tag.' })
  @ArrayMaxSize(10, { message: 'You cannot provide more than 10 tags.' })
  @Type(() => String)
  @IsString({ each: true, message: 'Each tag must be a string.' })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((tag) =>
        typeof tag === 'string' ? tag.trim().toLowerCase() : tag
      )
      : value
  )
  tags: string[]



}