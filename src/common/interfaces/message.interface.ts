import { IChat } from "./chat.interface";
import { IUser } from "./user.interface";




export interface IMessage {
  _id: string;
  chat: IChat | string;
  sender: IUser | string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'voice' | 'system';
  seenBy: IUser[] | string[];
  replyTo: IMessage | string | null;
  deletedFor: {
    user: IUser | string;
    deletedType: 'soft' | 'hard'
  }
  createdAt: Date;
  updatedAt: Date;
}