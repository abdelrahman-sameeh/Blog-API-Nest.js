import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ArticleBlockService } from "../services/article-block.service";
import mongoose from "mongoose";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";
import { generateUniqueFilename, getDestinationByMimeType } from "src/common/helper/file-upload";
import { ArticleOwnerGuard } from "../guards/article-owner.guard";
import { AddBlockDto } from "../dto/add-block.dto";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";


@Controller({ version: "1" })
export class ArticleBlockController {

  constructor(private articleBlockService: ArticleBlockService) { }

  @Delete("article/:articleId/block/:blockId")
  @IsAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlock(@Param("articleId") articleId: mongoose.Types.ObjectId,
    @Param("blockId") blockId: mongoose.Types.ObjectId
  ) {
    return this.articleBlockService.delete(articleId, blockId)
  }


  @Post("article/:id/block")
  @IsAuth()
  @UseGuards(ArticleOwnerGuard)
  @UseInterceptors(
    FileInterceptor("data", {
      storage: diskStorage({
        destination: getDestinationByMimeType,
        filename: generateUniqueFilename
      })
    }),
    WrapResponseInterceptor
  )
  addBlock(
    @Param("id", ParseMongoIdPipe) articleId: mongoose.Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: AddBlockDto
  ) {
    return this.articleBlockService.addBlock(articleId, file, body)
  }


}

