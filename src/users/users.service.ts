import { Inject, Injectable } from '@nestjs/common';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { Category } from 'src/categories/schema/category.schema';
import { Follow, FollowStatus } from 'src/follow/schema/follow.schema';
import { FriendRequest } from 'src/friend-request/schema/friend-request.schema';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { Article } from 'src/articles/schemas/article.schema';
import { basename, join } from 'path';
import * as sharp from 'sharp';
import { writeFile } from 'fs/promises';
import * as fs from "fs"
import { UpdateProfileInfoDto } from './dto/update-profile-info.dto';

@Injectable()
export class UsersService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
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
    user.status = AccountStatus.ACTIVE;
    await user.save();

    return {
      user
    }

  }

  async writerProfile(writerId: Types.ObjectId) {
    const user = this.request.user;
    let followers = [];
    let blockers = [];
    let friendRequest = {};

    const writer = await this.userModel.findById(writerId, "-password -__v -createdAt -updatedAt -role -email -preferences")

    if (user) {
      const follows = await this.followModel.find({
        $or: [
          { follower: user._id, following: writerId },
          { follower: writerId, following: user._id }
        ]
      });

      for (const follow of follows) {
        if (follow.status === FollowStatus.blocked) {
          blockers.push(follow.blocker);
        } else if (
          follow.follower.toString() === user._id.toString() &&
          follow.status === FollowStatus.accepted
        ) {
          followers.push(follow.follower);
        }
      }

      friendRequest = await this.friendRequestModel.findOne({ sender: user._id, receiver: writerId });
    }
    return {
      followers,
      blockers,
      writer,
      friendRequest: friendRequest || {}
    }
  }



  // ناس عاملين لى فولو وانا مش عاملهم
  private async followersOnlyCount() {
    const result = await this.followModel.aggregate([
      { $match: { following: this.request.user._id } },

      {
        $lookup: {
          from: "follows",
          let: { followerId: "$follower" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$follower", this.request.user._id] },
                    { $eq: ["$following", "$$followerId"] },
                  ],
                },
              },
            },
          ],
          as: "iFollowBack",
        },
      },

      { $match: { iFollowBack: { $size: 0 } } },

      { $count: "notFollowedByMeCount" },
    ]);

    return result[0]?.notFollowedByMeCount || 0;
  }


  // ناس عاملهم فولو ومش عاملين لى
  private async followingOnlyCount() {
    const result = await this.followModel.aggregate([
      // 1️⃣ أنا متابعهم
      {
        $match: {
          follower: this.request.user._id,
        },
      },

      // 2️⃣ هل عمل follow back؟
      {
        $lookup: {
          from: "follows",
          let: { followingId: "$following" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$follower", "$$followingId"] },
                    { $eq: ["$following", this.request.user._id] },
                  ],
                },
              },
            },
          ],
          as: "followBack",
        },
      },

      // 3️⃣ اللي مش عامل follow back
      {
        $match: {
          followBack: { $size: 0 },
        },
      },

      // 4️⃣ نعد الـ documents
      {
        $count: "notFollowingMeCount",
      },
    ]);

    // لو مفيش حد بيرجع، نرجع 0
    return result[0]?.notFollowingMeCount || 0;
  }


  // user profile setting 
  async getUserProfileStats() {
    const user = await this.userModel.findById(this.request.user._id, "-password -createdAt -updatedAt")
      .populate([
        { path: "preferences", model: Category.name, select: "title" }
      ]);

    const numberOfArticlesForUser = await this.articleModel.countDocuments({ user: user._id });

    const followersCount = await this.followModel.countDocuments({ following: user._id });

    const followingCount = await this.followModel.countDocuments({ follower: user._id });

    const followersOnlyCount = await this.followersOnlyCount()
    
    const followingOnlyCount = await this.followingOnlyCount()

    const pendingFriendRequestSentCount = await this.friendRequestModel.countDocuments({ sender: user._id })

    return {
      user,
      numberOfArticlesForUser,
      followersCount,
      followingCount,
      followersOnlyCount,
      followingOnlyCount,
      pendingFriendRequestSentCount
    }
  }


  public async changeProfileImage(file: Express.Multer.File) {
    const outputDir = join(process.cwd(), "uploads/profile-images");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `profile-${Date.now()}.webp`;
    const outputPath = join(outputDir, filename);

    const buffer = await sharp(file.buffer)
      .resize(400, 400, {
        fit: "cover",
      })
      .toFormat("webp", {
        quality: 75,
      })
      .toBuffer();

    await writeFile(outputPath, buffer);

    const imageUrl = `uploads/profile-images/${filename}`;

    const user = await this.userModel.findByIdAndUpdate(this.request.user._id, { picture: imageUrl });

    // remove previous profile picture
    const previousImagePath = join(__dirname, "..", "..", "uploads", "profile-images", basename(user.picture));
    if (fs.existsSync(previousImagePath)) {
      fs.unlinkSync(previousImagePath);
    }

    return {
      message: "profile image updated successfully",
      picture: imageUrl,
      size: `${Math.round(buffer.length / 1024)} KB`,
    };
  }


  async updateProfileInfo(updateProfileInfoDto: UpdateProfileInfoDto) {
    const user = await this.userModel.findByIdAndUpdate(this.request.user._id, updateProfileInfoDto, { new: true })
    return user
  }










}
