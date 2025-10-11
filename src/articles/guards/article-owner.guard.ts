import { CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Article } from "../schemas/article.schema";
import { Model } from "mongoose";
import { UserType } from "src/users/schema/user.schema";


export class ArticleOwnerGuard implements CanActivate {
  constructor(@InjectModel(Article.name) private readonly articleModel: Model<Article>) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const user: UserType = request.user
    const articleId = request.params.id
    const article = await this.articleModel.findById(articleId)
    if (!article) {
      throw new NotFoundException("article not found")
    }

    if (user?._id?.toString() != article?.user?._id?.toString()) {
      throw new ForbiddenException('not authorized to modify this post');
    }

    return true
  }
}
