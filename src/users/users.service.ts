import { Inject, Injectable } from '@nestjs/common';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { Category } from 'src/categories/schema/category.schema';

@Injectable()
export class UsersService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) { }

  async updatePreferences(updatePreferencesDto: UpdatePreferencesDto) {
    const user = await this.userModel.findById(this.request.user._id, "-password -createdAt -updatedAt -__v");

    if (updatePreferencesDto.random) {
      const randomCategories = await this.categoryModel.aggregate([
        { $sample: { size: 3 } },
        { $project: { _id: 1 } }
      ]);

      user.preferences = randomCategories.map(c => c._id);
      await user.save();

      return user;
    }

    const validCategories = [];
    for (const ca of updatePreferencesDto.categories) {
      const category = await this.categoryModel.findById(ca)
      category && validCategories.push(category._id);
    }

    user.preferences = validCategories;
    await user.save();

    return {
      user
    }

  }


}
