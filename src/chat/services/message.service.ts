import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Message } from "../schema/message.schema";
import { Model, Types } from "mongoose";
import { IMessage } from "src/common/interfaces/message.interface";
import { IUser } from "src/common/interfaces/user.interface";
import { User } from "src/users/schema/user.schema";


@Injectable()
export class MessageService {

  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) { }

  async create(payload: IMessage) {
    const message = new this.messageModel({
      chat: new Types.ObjectId(payload.chat as string),
      content: payload.content,
      replyTo: payload.replyTo ? new Types.ObjectId(payload.replyTo as string) : null,
      seenBy: payload.seenBy?.map(s => new Types.ObjectId(s as string)),
      sender: new Types.ObjectId((payload.sender as IUser)._id as string),
    });

    await message.save(); // لازم تحفظ
    await message.populate({
      path: "sender",
      model: User.name,
      select: "firstName lastName picture username role"
    });

    return message;
  }



}
