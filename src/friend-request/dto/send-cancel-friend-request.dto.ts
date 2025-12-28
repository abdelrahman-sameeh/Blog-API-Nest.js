import { Transform } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { Types } from "mongoose";



export class SendCancelFriendRequestDto{

  @IsNotEmpty()
  @Transform(({value})=> new Types.ObjectId(value))
  receiver: Types.ObjectId

}