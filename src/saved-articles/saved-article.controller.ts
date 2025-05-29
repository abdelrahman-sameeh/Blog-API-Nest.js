import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseInterceptors } from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { SavedArticlesDto } from "./dto/saved-articles.dto";
import { SavedArticleService } from "./saved-article.service";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";



@Controller({ version: '1' })
export class SavedArticleController {

  constructor(private readonly savedArticlesService: SavedArticleService) { }

  @Post("articles/saved")
  @Roles("user")
  @UseInterceptors(WrapResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  saveArticlesForUser(@Req() request, @Body() savedArticlesDto: SavedArticlesDto) {
    return this.savedArticlesService.saveArticlesForUser(request.user, savedArticlesDto.articles)
  }


  @Post("articles/unsaved")
  @Roles("user")
  @UseInterceptors(WrapResponseInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  unsavedArticleForUser(@Req() request, @Body() savedArticlesDto: SavedArticlesDto) {
    return this.savedArticlesService.unSaveArticlesForUser(request.user, savedArticlesDto.articles)
  }


}
