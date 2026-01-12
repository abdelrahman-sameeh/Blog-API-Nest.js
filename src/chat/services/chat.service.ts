import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Request } from "express";
import { User } from "src/users/schema/user.schema";
import { Follow, FollowStatus } from "src/follow/schema/follow.schema";
import { Chat } from "../schema/chat.schema";
import { Message } from "../schema/message.schema";
import { GetOrCreateChatDto } from "../dto/get-or-create-chat.dto";

@Injectable()
export class ChatService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,
  ) { }



  async getOrCreateChat(body: GetOrCreateChatDto) {
    const receiver = new Types.ObjectId(body.receiver);
    const sender = this.request.user._id;
    let chat = await this.chatModel.findOne({ members: { $all: [sender, receiver] } })
    if (chat) return chat;

    let chatType = "chat";

    const relation = await this.followModel.find({
      $or: [
        { follower: sender, following: receiver },
        { follower: receiver, following: sender },
      ],
    });

    if (relation.length < 2) {
      chatType = "request";
    }

    if (relation?.[0]?.status == FollowStatus.blocked || relation?.[1]?.status == FollowStatus.blocked) {
      throw new BadRequestException('This conversation is not available right now.')
    }

    const membersKey = [sender.toString(), receiver.toString()].sort().join("_");

    chat = await this.chatModel.create({ members: [sender, receiver], type: chatType, membersKey });

    return {
      chat,
      message:
        chatType === 'request'
          ? 'Chat request sent. Waiting for approval.'
          : 'Chat started successfully.',
    };;
  }



  async getChatWithMessages(chatId: Types.ObjectId) {
    const sender = this.request.user._id;
    const chat = await this.chatModel.findOne(chatId)
      .populate({ path: "members", model: User.name, select: "firstName lastName picture username role" });

    const messages = await this.messageModel.find({ chat: chatId }, "-chat")
      .sort({ createdAt: 1 })
      .populate({
        path: "sender",
        model: User.name,
        select: "firstName lastName picture username role"
      })
    const receiver = chat?.members.find(m => m?._id?.toString() != sender.toString());
    return {
      receiver,
      messages
    }
  }


  async sendMessage(chatId: Types.ObjectId, senderId: Types.ObjectId, content: string) {



  }



}
