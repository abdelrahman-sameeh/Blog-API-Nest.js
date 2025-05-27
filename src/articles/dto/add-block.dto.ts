import { IsEnum } from "class-validator";

export enum BlockType {
  VIDEO = "video",
  IMAGE = "image",
  CODE = "code",
  TEXT = "text",
}


export class AddBlockDto {
  @IsEnum(BlockType, { message: "type must be one of: video, image, code, text" })
  type: BlockType

  data: any

}
