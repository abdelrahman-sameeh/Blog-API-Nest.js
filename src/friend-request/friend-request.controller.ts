import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import { SendCancelFriendRequestDto } from "./dto/send-cancel-friend-request.dto";
import { FriendRequestService } from "./friend-request.service";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";
import { Types } from "mongoose";



@Controller({ version: "1" })
export class FriendRequestController {


  constructor(
    private friendRequestService: FriendRequestService
  ) { }



  @Get("friend-request")
  @IsAuth()
  getFriendRequest(@Query() query: { limit: number, page: number }) {
    return this.friendRequestService.getFriendRequest(query)
  }


  @Post("friend-request")
  @IsAuth()
  sendFriendRequest(@Body() createFriendRequestDto: SendCancelFriendRequestDto) {
    return this.friendRequestService.sendFriendRequest(createFriendRequestDto)
  }


  @Delete("friend-request")
  @IsAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  cancelFriendRequest(@Body() cancelFriendRequestDto: SendCancelFriendRequestDto) {
    return this.friendRequestService.cancelFriendRequest(cancelFriendRequestDto)
  }


  @Post('friend-request/:id/accept')
  @IsAuth()
  acceptRequest(@Param("id", ParseMongoIdPipe) id: Types.ObjectId){
    return this.friendRequestService.acceptRequest(id)
  }



  @Post('friend-request/:id/reject')
  @IsAuth()
  rejectRequest(@Param("id", ParseMongoIdPipe) id: Types.ObjectId){
    return this.friendRequestService.rejectRequest(id)
  }


  @Get('pending-requests-sent')
  @IsAuth()
  pendingRequestsSent(@Query() query){
    return this.friendRequestService.pendingRequestsSent(query)
  }




}
