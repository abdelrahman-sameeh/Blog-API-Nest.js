import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ArticleService } from "../services/articles.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import mongoose from "mongoose";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";
import { UpdateArticleCategoryDto } from "../dto/update-article-category.dto";
import { generateUniqueFilename, getDestinationByMimeType } from "src/common/helper/file-upload";
import { ArticleOwnerGuard } from "../guards/article-owner.guard";
import { UpdateArticleTagsDto } from "../dto/new-tags.dto";


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
    @Req() request: any
  ) {
    return this.articleService.create(body, files, request.user)
  }


  @Get("article")
  find(@Query() query) {
    return this.articleService.find(query)
  }


  @Get("mine/article")
  @IsAuth()
  findSpecificArticles(@Req() request, @Query() query) {
    return this.articleService.findSpecificArticles(request.user, query)
  }


  @Delete("article/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @IsAuth()
  delete(@Req() request, @Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.articleService.delete(request.user, id)
  }


  @Get("article/:id")
  @UseInterceptors(WrapResponseInterceptor)
  get(@Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.articleService.findOne(id)
  }


  @Patch("article/:id/category")
  @IsAuth()
  @UseGuards(ArticleOwnerGuard)
  @UseInterceptors(WrapResponseInterceptor)
  updateArticleCategory(@Req() request, @Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateArticleCategoryDto: UpdateArticleCategoryDto) {
    return this.articleService.updateArticleCategory(request.user, id, updateArticleCategoryDto)
  }


  @Patch("article/:id/tags")
  @IsAuth()
  @UseGuards(ArticleOwnerGuard)
  @UseInterceptors(WrapResponseInterceptor)
  updateArticleTags(@Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateArticleTagsDto: UpdateArticleTagsDto) {
    return this.articleService.updateArticleTags(id, updateArticleTagsDto)
  }


}









