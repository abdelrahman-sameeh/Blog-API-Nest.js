import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserType } from "src/users/schema/user.schema";
import { SavedArticle } from "./schema/saved.article.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Article } from "src/articles/schemas/article.schema";


@Injectable()
export class SavedArticleService {

  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(SavedArticle.name) private readonly savedArticleModel: Model<SavedArticle>
  ) { }

  async saveArticlesForUser(user: UserType, articles: string[]) {
    for (const articleId of articles) {
      const article = await this.articleModel.findById(articleId)
      if (!article) {
        throw new NotFoundException(`article not found ${articleId}`)
      }
    }

    for (const articleId of articles) {
      const savedArticle = await this.savedArticleModel.findOne({ article: articleId, user: user._id })
      if (!savedArticle) {
        await this.savedArticleModel.create({ article: articleId, user: user._id })
      }
    }
    return
  }

  async unSaveArticlesForUser(user: UserType, articles: string[]) {
    for (const article of articles) {
      await this.savedArticleModel.deleteOne({ user: user._id, article })
    }
    return
  }


  

}

