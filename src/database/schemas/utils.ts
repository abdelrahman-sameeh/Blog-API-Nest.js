import { User, UserSchema } from "src/users/schema/user.schema";
import { ResetCode, ResetCodeSchema } from "./reset-code.schema";
import { Category, CategorySchema } from "src/categories/schema/category.schema";
import { Article, ArticleSchema } from "src/articles/schemas/article.schema";
import { ArticleBlock, ArticleBlockSchema } from "src/articles/schemas/article-block.schema";
import { SavedArticle, SavedArticleSchema } from "src/saved-articles/schema/saved.article.schema";
import { Review, ReviewSchema } from "src/review/schema/review.schema";
import { Tag, TagSchema } from "src/tags/schema/tag.schema";

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: ResetCode.name, schema: ResetCodeSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Article.name, schema: ArticleSchema },
  { name: ArticleBlock.name, schema: ArticleBlockSchema },
  { name: SavedArticle.name, schema: SavedArticleSchema },
  { name: Review.name, schema: ReviewSchema },
  { name: Tag.name, schema: TagSchema },
]


