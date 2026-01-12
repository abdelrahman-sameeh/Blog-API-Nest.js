import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import { ChatService } from "./services/chat.service";
import { GetOrCreateChatDto } from "./dto/get-or-create-chat.dto";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";
import { Types } from "mongoose";


@Controller({ version: '1' })
export class ChatController {

  constructor(private readonly chatService: ChatService) { }


  @Post("get-or-create-chat")
  @IsAuth()
  getOrCreateChat(
    @Body() getOrCreateChatDto: GetOrCreateChatDto,
  ) {
    return this.chatService.getOrCreateChat(getOrCreateChatDto)
  }


  @Get("chat/:id")
  @IsAuth()
  getChatWithMessages(@Param("id", ParseMongoIdPipe) chatId: Types.ObjectId) {
    return this.chatService.getChatWithMessages(chatId)
  }



}
