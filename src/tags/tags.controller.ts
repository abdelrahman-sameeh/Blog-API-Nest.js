import { Controller, Get } from "@nestjs/common";
import { TagsService } from "./tags.service";



@Controller({version: "1", path: "tag"})
export class TagsController{
  constructor(private readonly tagsService: TagsService){}

  @Get()
  find(){
    return this.tagsService.find()
  }


}