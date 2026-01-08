import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ArticleService } from "../services/articles.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import mongoose, { Types } from "mongoose";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";
import { UpdateArticleCategoryDto } from "../dto/update-article-category.dto";
import { generateUniqueFilename, getDestinationByMimeType } from "src/common/helper/file-upload";
import { ArticleOwnerGuard } from "../guards/article-owner.guard";
import { UpdateArticleTagsDto } from "../dto/update-article-tags.dto";
import { IsOptionalAuth } from "src/common/decorators/is-optional-auth.decorator";
import { UpdateArticleDto } from "../dto/update-article.dto";


@Controller({ version: '1' })
export class ArticleController {

  constructor(private readonly articleService: ArticleService) { }

  @Post("article")
  @Roles("user")
  @UseInterceptors(
    WrapResponseInterceptor,
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: getDestinationByMimeType,
        filename: generateUniqueFilename
      })
    }))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    return this.articleService.create(body, files)
  }


  @Get("article")
  find(@Query() query) {
    return this.articleService.find(query)
  }


  @Get("articles/home")
  @IsAuth()
  homePageArticles(@Query() query) {
    return this.articleService.homePageArticles(query)
  }


  @Get("mine/article")
  @IsAuth()
  findMineArticles(@Query() query) {
    return this.articleService.findMineArticles(query)
  }


  @Get("user/:id/articles")
  getArticlesByWriter(@Param("id", ParseMongoIdPipe) writerId: Types.ObjectId, @Query() query) {
    return this.articleService.getArticlesByWriter(writerId, query)
  }


  @Get("article/:id")
  @IsOptionalAuth()
  @UseInterceptors(WrapResponseInterceptor)
  get(@Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.articleService.findOne(id)
  }

  @Delete("article/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @IsAuth()
  delete(@Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.articleService.delete(id)
  }


  @Patch("article/:id")
  @IsAuth()
  @UseGuards(ArticleOwnerGuard)
  updateArticle(@Param("id", ParseMongoIdPipe) id: Types.ObjectId, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.updateArticle(id, updateArticleDto);
  }


  @Patch("article/:id/category")
  @IsAuth()
  @UseGuards(ArticleOwnerGuard)
  @UseInterceptors(WrapResponseInterceptor)
  updateArticleCategory(@Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateArticleCategoryDto: UpdateArticleCategoryDto) {
    return this.articleService.updateArticleCategory(id, updateArticleCategoryDto)
  }


  @Patch("article/:id/tags")
  @IsAuth()
  @UseGuards(ArticleOwnerGuard)
  @UseInterceptors(WrapResponseInterceptor)
  updateArticleTags(@Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateArticleTagsDto: UpdateArticleTagsDto) {
    return this.articleService.updateArticleTags(id, updateArticleTagsDto)
  }


  @Patch("article/:id/like")
  @IsAuth()
  @UseInterceptors(WrapResponseInterceptor)
  likeArticle(@Param("id", ParseMongoIdPipe) articleId) {
    return this.articleService.likeArticle(articleId)
  }


  @Patch("article/:id/dislike")
  @IsAuth()
  @UseInterceptors(WrapResponseInterceptor)
  dislikeArticle(@Param("id", ParseMongoIdPipe) id) {
    return this.articleService.dislikeArticle(id)
  }


  @Get("articles/feed")
  @IsAuth()
  getFeed(@Query() query){
    return this.articleService.getFeed(query)
  }

}









