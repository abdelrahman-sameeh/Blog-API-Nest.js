import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Article } from "../schemas/article.schema";
import mongoose, { Model, ObjectId } from "mongoose";
import { UserType } from "src/users/schema/user.schema";
import { ArticleBlock } from "../schemas/article-block.schema";
import { Category } from "src/categories/schema/category.schema";
import { Pagination } from "src/common/helper/pagination";
import { UpdateArticleCategoryDto } from "../dto/update-article-category.dto";
import { UpdateArticleTagsDto } from "../dto/update-article-tags.dto";

@Injectable()
export class ArticleService {

  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ArticleBlock.name) private readonly articleBlockModel: Model<ArticleBlock>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) { }


  async create(body: any, files: Express.Multer.File[], user: UserType) {
    const title = body['title']
    if (!title) {
      throw new BadRequestException("Title is required")
    }

    const category = await this.categoryModel.findById(body?.category, "title")
    if (!category) {
      throw new BadRequestException('Invalid category ID');
    }

    const tags: string[] = Array.isArray(body?.tags)
      ? body.tags
      : typeof body?.tags === 'string'
        ? body.tags.split(',').map((tag: string) => tag.toLowerCase().trim())
        : [];

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
      tags,
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


  private async buildArticleQuery(query: any, userId?: mongoose.Types.ObjectId) {
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
      queryString.tags = { $in: tags }
    }

    return queryString;
  }


  async find(query) {
    const { page, limit } = query;
    const queryString = await this.buildArticleQuery(query);
    const populate = [{ path: "category", select: "title" }];

    const paginator = new Pagination(this.articleModel, queryString, page, limit, {}, populate);
    return await paginator.paginate();
  }


  async findSpecificArticles(user: UserType, query) {
    const { page, limit } = query;
    const queryString = await this.buildArticleQuery(query, user._id);
    const populate = [{ path: "category", select: "title" }];

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
    const article = await this.articleModel.findById(id).populate("category", "title")
    if (!article) {
      throw new NotFoundException(`not found article ${id}`)
    }
    const blocks = await this.articleBlockModel.find({ article: article._id }, "type data order").sort({ order: 1 })
    return {
      ...article.toObject(),
      blocks
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




}



