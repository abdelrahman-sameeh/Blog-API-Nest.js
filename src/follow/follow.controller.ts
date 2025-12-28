import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateFollowDto } from "./dto/create-follow.dto";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import { FollowService } from "./follow.service";
import { CreateUnfollowDto } from "./dto/create-unfollow.dto";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";



@Controller({ version: "1" })
export class FollowController {

  constructor(private readonly followService: FollowService) { }

  @Post("follow")
  @IsAuth()
  follow(@Body() createFollowDto: CreateFollowDto) {
    return this.followService.follow(createFollowDto)
  }


  @Post("unfollow")
  @IsAuth()
  unfollow(@Body() createUnfollowDto: CreateUnfollowDto) {
    return this.followService.unfollow(createUnfollowDto)
  }

  @Get("followers")
  @IsAuth()
  getFollowers(@Query() query) {
    return this.followService.getFollowers(query)
  }

  @Get("following")
  @IsAuth()
  getFollowing(@Query() query) {
    return this.followService.getFollowing(query)
  }


  @Patch("block/user/:id")
  @IsAuth()
  blockUser(@Param("id", ParseMongoIdPipe) blockedId) {
    return this.followService.blockUser(blockedId)
  }


  @Patch("unblock/user/:id")
  @IsAuth()
  unblockUser(@Param("id", ParseMongoIdPipe) blockedId) {
    return this.followService.unblockUser(blockedId)
  }

  @Get("followers-only")
  @IsAuth()
  getFollowersOnly(@Query() query) {
    return this.followService.getFollowersOnly(query)
  }

  @Get("following-only")
  @IsAuth()
  getFollowingOnly(@Query() query) {
    return this.followService.getFollowingOnly(query)
  }



}
