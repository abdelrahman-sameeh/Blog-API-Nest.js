import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseInterceptors } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";
import { UpdateCategoryDto } from "./dto/update-category.dto";


@Controller({ path: "category", version: '1' })
@UseInterceptors(WrapResponseInterceptor)
export class CategoriesController {

  constructor(private readonly categoryService: CategoriesService) { }

  @Roles("admin")
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get()
  find() {
    return this.categoryService.find()
  }

  @Roles("admin")
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOne(id)
  }

  @Roles("admin")
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOne(@Param("id") id: string) {
    return this.categoryService.deleteOne(id)
  }


  @Roles("admin")
  @Post("fake")
  createFake(){
    return this.categoryService.fakeCategories()
  }

}
