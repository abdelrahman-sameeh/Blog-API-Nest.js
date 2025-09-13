import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Tag } from "./schema/tag.schema";
import { Model } from "mongoose";


@Injectable()
export class TagsService{

  constructor(@InjectModel(Tag.name) private readonly tagModel: Model<Tag>){}  

  async find(){
    return await this.tagModel.find({}, "-createdAt -updatedAt -__v")
  }

}
