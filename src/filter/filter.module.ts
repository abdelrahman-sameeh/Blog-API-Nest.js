import { Module } from "@nestjs/common";
import { FilterController } from "./filter.controller";
import { TagsModule } from "src/tags/tags.module";
import { CategoriesModule } from "src/categories/categories.module";



@Module({
  imports: [TagsModule, CategoriesModule],
  controllers: [FilterController]
})
export class FilterModule {}
