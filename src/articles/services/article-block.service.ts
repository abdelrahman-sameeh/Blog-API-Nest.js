import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { ArticleBlock } from "../schemas/article-block.schema";
import { Article } from "../schemas/article.schema";
import { AddBlockDto } from "../dto/add-block.dto";
import { join } from "path"
import * as fs from "fs"
import { REQUEST } from "@nestjs/core";


@Injectable()
export class ArticleBlockService {

  constructor(
    @Inject(REQUEST) private readonly request,
    @InjectModel(ArticleBlock.name) private readonly articleBlockModel: Model<ArticleBlock>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>
  ) { }



  async delete(articleId: mongoose.Types.ObjectId, blockId: mongoose.Types.ObjectId) {
    const article = await this.articleModel.findOne({ user: this.request.user._id, _id: articleId })
    if (!article) {
      throw new NotFoundException(`article not found ${articleId}`)
    }
    const block = await this.articleBlockModel.findOneAndDelete({ article: article._id, _id: blockId })
    if (!block) {
      throw new NotFoundException(`block not found ${blockId}`)
    }
    // remove file from server
    if (block.type == "image" || block.type == "video") {
      const filePath = join(...block.data.split("/"))
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    return
  }


  async addBlock(articleId: mongoose.Types.ObjectId, file: Express.Multer.File, body: AddBlockDto) {
    const lastBlock = await this.articleBlockModel.findOne({ article: articleId }).sort({ order: -1 }).lean()
    const order = (lastBlock?.order ?? 0) + 1

    let type: string;
    let data: string;

    if (file) {
      const mimetype = file.mimetype.split("/")[0]

      if (!["image", "video"].includes(mimetype)) {
        throw new BadRequestException(`File must be image or video`)
      }
      type = mimetype
      data = file.path;
    } else {
      if (!body?.data) {
        throw new BadRequestException("Missing data in request body.");
      }

      data = body.data;
      type = body.type;
    }

    const block = await this.articleBlockModel.create({
      article: articleId,
      type,
      data,
      order,
    })

    return block

  }


}
