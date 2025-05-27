import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Category } from "./schema/category.schema";
import { Model } from "mongoose";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";



@Injectable()
export class CategoriesService {

  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryModel.findOne({ title: createCategoryDto.title.toLocaleLowerCase() })
    if (category) {
      throw new ConflictException("category already exists")
    }
    const newCategory = await this.categoryModel.create(createCategoryDto)
    return newCategory.toObject()
  }

  async find() {
    return await this.categoryModel.find()
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id)
    if(!category){
      throw new NotFoundException("category not found")
    }
    return category 
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true })
    if(!category){
      throw new NotFoundException("category not found")
    }
    return category 
  }
  
  async deleteOne(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id)
    if(!category){
      throw new NotFoundException("category not found")
    }
    return 
  }

}
