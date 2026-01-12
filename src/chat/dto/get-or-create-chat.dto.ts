import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";


export class GetOrCreateChatDto {

  @IsNotEmpty()
  @IsMongoId()
  receiver: Types.ObjectId

}