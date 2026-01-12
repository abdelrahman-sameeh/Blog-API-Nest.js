import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./services/chat.service";
import { MessageService } from "./services/message.service";



@Module({
  imports: [],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, MessageService]
})
export class ChatModule { }