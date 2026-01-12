import { IMessage } from "./message.interface";
import { IUser } from "./user.interface";

export interface IChat {
  members: IUser[];
  membersKey: string;
  status: {
    user: IUser | null;
    action: 'active' | 'blocked' | 'reported';
  }
  lastMessage: IMessage;
  type: "chat" | "request"
}