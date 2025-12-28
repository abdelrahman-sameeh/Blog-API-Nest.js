import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FriendRequest } from "./schema/friend-request.schema";
import { Model, Types } from "mongoose";
import { SendCancelFriendRequestDto } from "./dto/send-cancel-friend-request.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { User } from "src/users/schema/user.schema";
import { Pagination } from "src/common/helper/pagination";
import { Follow, FollowStatus } from "src/follow/schema/follow.schema";



@Injectable()
export class FriendRequestService {

  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
  ) { }


  public async getFriendRequest(query: { limit: number, page: number }) {
    const { page, limit } = query;
    const populate = [{ path: "sender", model: User.name, select: "firstName lastName picture" }];
    const paginator = new Pagination(this.friendRequestModel, {}, page, limit, {}, populate, "sender");
    return await paginator.paginate();
  }


  public async sendFriendRequest(createFriendRequestDto: SendCancelFriendRequestDto) {
    const data = {
      ...createFriendRequestDto,
      sender: this.request.user._id
    }

    const exist = await this.friendRequestModel.findOne(data)
    if (exist) {
      return exist;
    }

    const friendRequest = await this.friendRequestModel.create(data);
    return friendRequest;
  }


  public async cancelFriendRequest(cancelFriendRequestDto: SendCancelFriendRequestDto) {
    const data = {
      ...cancelFriendRequestDto,
      sender: this.request.user._id
    }

    await this.friendRequestModel.findOneAndDelete(data)
    return
  }


  // accept friend request
  public async acceptRequest(id: Types.ObjectId) {
    const friendRequest = await this.friendRequestModel.findByIdAndDelete(id);
    const follow = await this.followModel.create({ follower: friendRequest.sender, following: friendRequest.receiver, status: FollowStatus.accepted })
    return {
      message: "accepted successfully",
      data: follow
    }
  }

  // reject friend request
  public async rejectRequest(id: Types.ObjectId) {
    await this.friendRequestModel.deleteOne(id);
    return {
      message: "rejected successfully",
    }
  }



  async pendingRequestsSent(query) {
    const filter = {
      sender: this.request.user._id
    }
    const { page = 1, limit = 10 } = query;
    const populate = [{ path: "receiver", select: "firstName lastName status username visibility picture", model: User.name }];
    const projection = "-sender -createdAt -updatedAt";

    const request = new Pagination(this.friendRequestModel, filter, page, limit, "-createdAt", populate, projection);

    const result = await request.paginate()

    // serialized data
    result.data = Object.values(result.data)[0].map(ob => ob.receiver);

    return result
  }

}

