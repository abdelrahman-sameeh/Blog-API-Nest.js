import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Article } from "../schemas/article.schema";
import mongoose, { Model, ObjectId, Types } from "mongoose";
import { User, UserType } from "src/users/schema/user.schema";
import { ArticleBlock } from "../schemas/article-block.schema";
import { Category } from "src/categories/schema/category.schema";
import { Pagination } from "src/common/helper/pagination";
import { UpdateArticleCategoryDto } from "../dto/update-article-category.dto";
import { UpdateArticleTagsDto } from "../dto/update-article-tags.dto";
import { Tag } from "src/tags/schema/tag.schema";
import { Review } from "src/review/schema/review.schema";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import path from "path"
import { SavedArticle } from "src/saved-articles/schema/saved.article.schema";

@Injectable()
export class ArticleService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ArticleBlock.name) private readonly articleBlockModel: Model<ArticleBlock>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(SavedArticle.name) private readonly savedArticleModel: Model<SavedArticle>,
  ) { }


  private _getServerUrl(...parts: string[]) {
    /* 
      Base url is >> http://localhost:3000
      if we need add /api/v1 to url to be 
      http://localhost:3000/api/v1
      set in parts param _getServerUrl("api", "v1");
    */
    const baseUrl = `${this.request.protocol}://${this.request.get("host")}`;
    const url = parts.length ? new URL(parts.join("/"), baseUrl + "/") : baseUrl + "/";
    return url.toString();
  }


  public _addServerUrl (path: string) {
    if (!path) return path;
    return path.startsWith("http") ? path : `${this._getServerUrl()}${path}`;
  }

  async create(body: any, files: Express.Multer.File[], user: UserType) {
    const title = body['title']
    if (!title) {
      throw new BadRequestException("Title is required")
    }

    const category = await this.categoryModel.findById(body?.category, "title")
    if (!category) {
      throw new BadRequestException('Invalid category ID');
    }

    let tags = body.tags
    const tagIds = []

    if (tags) {
      tags = tags.map((tag: string) => {
        return tag.toLowerCase().trim().replaceAll(/\s+/g, "-")
      })

      for (const tag of tags) {
        const existTag = await this.tagModel.findOne({ title: tag })
        if (!existTag) {
          const newTag = await this.tagModel.create({ title: tag })
          tagIds.push(newTag._id)
          continue
        }
        tagIds.push(existTag._id)
      }
    }


    const blocks: any[] = [];

    const blockIndices = [...new Set(
      Object.keys(body)
        .filter((key) => key.startsWith('blocks['))
        .map((key) => key.match(/blocks\[(\d+)\]/)?.[1])
    )
    ]

    blockIndices.forEach((index) => {
      const type = body[`blocks[${index}].type`];
      const order = Number(body[`blocks[${index}].order`]);

      if (!type) {
        throw new BadRequestException(`missing type for block ${index}`);
      }

      if (!order) {
        throw new BadRequestException(`missing order for block ${index}`);
      }

      let data: any;

      if (type === 'image' || type === 'video') {
        const file = files.find((f) => f.fieldname === `blocks[${index}].data`);
        if (!file) {
          throw new BadRequestException(`missing file for block ${index}`);
        }

        data = file.path

      } else {
        data = body[`blocks[${index}].data`];
        if (!data) {
          throw new BadRequestException(`missing data for block ${index}`);
        }
      }

      blocks.push({
        type, data, order,
      });
    })

    const article = await this.articleModel.create({
      category,
      user: user._id,
      tags: tagIds,
      title
    })

    const savedBlocks = await Promise.all(blocks.map(async (block) => {
      const savedBlock = await this.articleBlockModel.create({ ...block, article: article._id })
      return {
        type: savedBlock.type,
        data: savedBlock.data,
        order: savedBlock.order,
        _id: savedBlock._id
      }
    }))

    return {
      ...article.toObject(),
      blocks: savedBlocks.sort((a, b) => a.order - b.order)
    }
  }


  private async buildArticleQuery(query, userId?) {
    const { search, category, tags } = query;
    const queryString: any = {};

    if (userId) {
      queryString.user = userId;
    }

    if (category) {
      try {
        const categoryId = new mongoose.Types.ObjectId(category);
        const existCategory = await this.categoryModel.findById(categoryId);
        if (!existCategory) {
          throw new NotFoundException(`not found this category ${category}`);
        }
        queryString.category = categoryId;
      } catch (err) {
        throw new BadRequestException(`invalid category id ${category}`);
      }
    }

    if (search) {
      queryString.title = { $regex: search, $options: "i" };
    }

    if (tags) {
      const tagsIds = tags.map(tagId => {
        try {
          return new Types.ObjectId(tagId)
        } catch (err) {
          throw new BadRequestException("tag must be mongo id")
        }
      })
      queryString.tags = { $in: tagsIds }
    }

    return queryString;
  }


  async find(query) {
    const { page, limit } = query;
    const queryString = await this.buildArticleQuery(query);
    const populate = [
      { path: "category", select: "title" },
      { path: "tags", model: Tag.name, select: "title" }
    ];

    const paginator = new Pagination(this.articleModel, queryString, page, limit, {}, populate);
    return await paginator.paginate();
  }


  async findSpecificArticles(user: User, query) {
    const { page, limit } = query;
    const queryString = await this.buildArticleQuery(query, user._id);
    const populate = [
      { path: "category", select: "title" },
      { path: "tags", model: Tag.name, select: "title" }
    ];

    const paginator = new Pagination(this.articleModel, queryString, page, limit, {}, populate);
    return await paginator.paginate();
  }


  async delete(user: UserType, id: mongoose.Types.ObjectId) {
    const article = await this.articleModel.findOneAndDelete({ _id: id, user: user._id })
    if (!article) {
      throw new NotFoundException(`not found article ${id}`)
    }
    await this.articleBlockModel.deleteMany({ article: article?._id })
    return
  }


  async findOne(id: mongoose.Types.ObjectId) {
    const article = await this.articleModel
      .findById(id)
      .populate("user", "firstName lastName picture username")
      .populate([
        { path: "category", select: "title" },
        { path: "tags", model: Tag.name, select: "title" },
        { path: "likes", model: User.name, select: "firstName lastName picture" }
      ]).lean()

    if (!article) {
      throw new NotFoundException(`not found article ${id}`)
    }

    article.user["picture"] = this._addServerUrl(article.user["picture"])

    article.likes.forEach(userLiked => {
      userLiked["picture"] = this._addServerUrl(userLiked["picture"])
    })

    const blocks = await this.articleBlockModel
      .find({ article: article._id }, "type data order lang")
      .sort({ order: 1 })

    const comments = await this.reviewModel
      .find({ article: id }, "-article -updatedAt -__v")
      .populate([{ path: "author", select: "firstName lastName picture" }])
      .limit(10)
      .lean()

    for (let i = 0; i < comments.length; i++) {
      const numberOfReplies = await this.reviewModel.countDocuments({ parentReview: comments[i]._id })
      comments[i]["numberOfReplies"] = numberOfReplies;

      comments[i]["author"]["picture"] = this._addServerUrl(comments[i]["author"]["picture"])
    }

    blocks.map(block => {
      if (["image", "video"].includes(block.type)) {
        block.data = this._addServerUrl(block.data);
      }
    })

    let isSavedArticle = false;

    if (this.request.user) {
      const doc = await this.savedArticleModel.findOne({
        user: this.request.user._id,
      })
      if (doc) {
        isSavedArticle = true
      }
    }

    return {
      ...article,
      blocks,
      comments,
      isSavedArticle
    }
  }



  async updateArticleCategory(user: UserType, id: mongoose.Types.ObjectId, updateArticleCategoryDto: UpdateArticleCategoryDto) {
    const article = await this.articleModel.findOneAndUpdate({ user: user._id, _id: id }, updateArticleCategoryDto, { new: true }).populate("category")
    if (!article) {
      throw new NotFoundException(`article not found ${id}`)
    }
    return article.toObject()
  }


  async updateArticleTags(id: mongoose.Types.ObjectId, updateArticleTagsDto: UpdateArticleTagsDto) {
    const article = await this.articleModel.findByIdAndUpdate(id, { $set: { tags: updateArticleTagsDto.tags } }, { new: true })
    if (!article) {
      throw new NotFoundException(`article not found ${id}`)
    }
    return article
  }


  async likeArticle(user: User, articleId) {
    const article = await this.articleModel.findById(articleId)
    if (!article) {
      throw new NotFoundException("Article not found")
    }
    if (!article.likes.includes(user._id as any)) {
      article.likes.push(user._id as any)
    }
    return article.save()
  }

  async dislikeArticle(user: User, articleId) {
    const article = await this.articleModel.findById(articleId)
    if (!article) {
      throw new NotFoundException("Article not found")
    }
    const index = article.likes.indexOf(user._id as any)
    if (index !== -1) {
      article.likes.splice(index, 1)
    }
    return article.save()
  }


}



