import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsMongoId } from "class-validator";

export class SavedArticlesDto{

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true }) 
  @Type(() => String) 
  articles: string[];

}
