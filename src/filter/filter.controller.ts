import { Controller, Get } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "src/categories/schema/category.schema";
import { Tag } from "src/tags/schema/tag.schema";



@Controller({version: "1"})
export class FilterController {

  constructor(
    @InjectModel(Tag.name) private readonly tagsModel: Model<Tag>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ){}

  @Get("filters")
  async getFilters(){
    const tags = await this.tagsModel.find().select("title").exec();
    const categories = await this.categoryModel.find().select("title").exec();
    return {tags, categories}
  }

}