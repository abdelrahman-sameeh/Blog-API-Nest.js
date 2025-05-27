import { User, UserSchema } from "src/users/schema/user.schema";
import { ResetCode, ResetCodeSchema } from "./reset-code.schema";
import { Category, CategorySchema } from "src/categories/schema/category.schema";
import { Article, ArticleSchema } from "src/articles/schemas/article.schema";
import { ArticleBlock, ArticleBlockSchema } from "src/articles/schemas/article-block.schema";

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: ResetCode.name, schema: ResetCodeSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Article.name, schema: ArticleSchema },
  { name: ArticleBlock.name, schema: ArticleBlockSchema },
]