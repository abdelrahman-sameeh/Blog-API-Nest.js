import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Req, UseInterceptors } from "@nestjs/common";
import { SavedArticlesDto } from "./dto/saved-articles.dto";
import { SavedArticleService } from "./saved-article.service";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";
import { IsAuth } from "src/common/decorators/is-auth.decorator";



@Controller({ version: '1' })
export class SavedArticleController {

  constructor(private readonly savedArticlesService: SavedArticleService) { }

  @Post("articles/save")
  @IsAuth()
  @UseInterceptors(WrapResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  saveArticlesForUser(@Req() request, @Body() savedArticlesDto: SavedArticlesDto) {
    return this.savedArticlesService.saveArticlesForUser(request.user, savedArticlesDto.articles)
  }
  
  
  @Delete("articles/unsave")
  @IsAuth()
  @UseInterceptors(WrapResponseInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  unsavedArticleForUser(@Req() request, @Body() savedArticlesDto: SavedArticlesDto) {
    return this.savedArticlesService.unSaveArticlesForUser(request.user, savedArticlesDto.articles)
  }


}
