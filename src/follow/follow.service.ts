import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFollowDto } from "./dto/create-follow.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Follow, FollowStatus } from "./schema/follow.schema";
import { Model, Types } from "mongoose";
import { User } from "src/users/schema/user.schema";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { CreateUnfollowDto } from "./dto/create-unfollow.dto";



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


  async getFollowers() {
    const userId = this.request.user._id;

    const followers = await this.followModel.find(
      {
        following: userId,
        status: FollowStatus.accepted
      },
      "follower"
    ).populate("follower", "-password -createdAt -updatedAt -__v")

    return followers
  }


  async getFollowing() {
    const userId = this.request.user._id;

    const following = await this.followModel.find(
      {
        follower: userId,
        status: FollowStatus.accepted
      },
      "following"
    ).populate("following", "-password -createdAt -updatedAt -__v")

    return following
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

}
