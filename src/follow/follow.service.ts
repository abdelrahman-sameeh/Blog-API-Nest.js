import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFollowDto } from "./dto/create-follow.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Follow, FollowStatus } from "./schema/follow.schema";
import { Model, Types } from "mongoose";
import { User } from "src/users/schema/user.schema";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { CreateUnfollowDto } from "./dto/create-unfollow.dto";
import { Pagination } from "src/common/helper/pagination";



@Injectable()
export class FollowService {

  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(REQUEST) private request: Request
  ) { }

  async follow(createFollowDto: CreateFollowDto) {
    const userId: any = this.request?.user?._id;

    if (userId.toString() == createFollowDto.following?.toString()) {
      throw new HttpException("can't create follow for your self", HttpStatus.BAD_REQUEST);
    }

    const existing = await this.followModel.findOne({ follower: userId, following: createFollowDto.following });
    if (existing) return existing;

    for (const id of Object.values(createFollowDto)) {
      const user = await this.userModel.exists(new Types.ObjectId(id))
      if (user == null) {
        throw new NotFoundException(`not found user belongs to this id ${id}`)
      }
    }

    const data = {
      ...createFollowDto,
      follower: userId
    }

    const follow = this.followModel.create(data);
    return follow
  }


  async unfollow(createUnfollowDto: CreateUnfollowDto) {
    const userId = this.request.user._id;
    const followingId = createUnfollowDto.following;

    if (userId.toString() === followingId.toString()) {
      throw new HttpException(
        "you cannot unfollow yourself",
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.followModel.findOneAndDelete({
      follower: userId,
      following: followingId,
    });

    if (!existing) {
      throw new NotFoundException("you are not following this user");
    }

    return { message: "unfollowed successfully" };
  }


  async getFollowers(query) {
    const userId = this.request.user._id;
    const { page, limit } = query
    const filter = {
      following: userId,
      status: FollowStatus.accepted
    };
    const populate = [{ path: "follower", select: "-password -createdAt -updatedAt -__v -preferences -email" }];
    const projection = "follower";

    const followers = new Pagination(this.followModel, filter, page, limit, "-createdAt", populate, projection)
    const result = await followers.paginate();

    const follows = Object.values(result.data)[0].map(
      (f: any) => f.follower
    );

    result.data = follows;

    return result
  }


  async getFollowing(query) {
    const userId = this.request.user._id;
    const { page, limit } = query;

    const filter = {
      follower: userId,
      status: FollowStatus.accepted,
    };

    const populate = [
      {
        path: "following",
        select: "-password -createdAt -updatedAt -__v -preferences -email",
      },
    ];

    const projection = "following";

    const followingPagination = new Pagination(
      this.followModel,
      filter,
      page,
      limit,
      "-createdAt",
      populate,
      projection
    );

    const result = await followingPagination.paginate();

    const followings = Object.values(result.data)[0].map(
      (f: any) => f.following
    );

    result.data = followings;

    return result;
  }


  async blockUser(blockedId: Types.ObjectId) {
    const user = this.request.user
    const follow = await this.followModel
      .findOneAndUpdate(
        {
          follower: user._id, following: blockedId
        },
        { status: FollowStatus.blocked, blocker: user._id, blocked: blockedId },
      );
    if (!follow) {
      throw new NotFoundException("Follow relation not found");
    }
    return { status: "success", message: "user blocked successfully" }
  }


  async unblockUser(blockedId: Types.ObjectId) {
    const user = this.request.user
    const follow = await this.followModel.findOneAndUpdate(
      {
        follower: user._id, following: blockedId
      },
      { status: FollowStatus.accepted, blocker: null, blocked: null },
      { new: true }
    );
    if (!follow) {
      throw new NotFoundException("Follow relation not found");
    }
    return { status: "success", message: "user unblocked successfully" }
  }



  async getFollowingOnly(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

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

      // 4️⃣ نجيب user
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "user",
        },
      },

      // 5️⃣ نفك الـ array
      { $unwind: "$user" },

      // 6️⃣ نرجّع user كـ root
      {
        $replaceRoot: {
          newRoot: "$user",
        },
      },

      // 7️⃣ نخفي الحقول الحساسة
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          visibility: 1,
          picture: 1,
          status: 1,
        },
      },

      // 8️⃣ Pagination + Count
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [
            { $count: "count" },
          ],
        },
      },
    ]);

    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
      status: "success",
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async getFollowersOnly(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await this.followModel.aggregate([
      // 1️⃣ هم عاملين لي follow
      { $match: { following: this.request.user._id } },

      // 2️⃣ هل أنا عاملهم follow؟
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

      // 3️⃣ اللي أنا مش متابعهم
      { $match: { iFollowBack: { $size: 0 } } },

      // 4️⃣ نجيب user
      { $lookup: { from: "users", localField: "follower", foreignField: "_id", as: "user" } },

      { $unwind: "$user" },

      { $replaceRoot: { newRoot: "$user" } },

      { $project: { firstName: 1, lastName: 1, username: 1, visibility: 1, picture: 1, status: 1 } },

      // 8️⃣ pagination
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await this.followModel.countDocuments({ following: this.request.user._id });

    return {
      status: "success",
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: users,
    };
  }








}
