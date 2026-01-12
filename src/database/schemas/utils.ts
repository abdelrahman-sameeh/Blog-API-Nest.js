import { User, UserSchema } from "src/users/schema/user.schema";
import { ResetCode, ResetCodeSchema } from "./reset-code.schema";
import { Category, CategorySchema } from "src/categories/schema/category.schema";
import { Article, ArticleSchema } from "src/articles/schemas/article.schema";
import { ArticleBlock, ArticleBlockSchema } from "src/articles/schemas/article-block.schema";
import { SavedArticle, SavedArticleSchema } from "src/saved-articles/schema/saved.article.schema";
import { Review, ReviewSchema } from "src/review/schema/review.schema";
import { Tag, TagSchema } from "src/tags/schema/tag.schema";
import { ReportReason, ReportReasonSchema } from "src/report-articles/schema/report-reason.schema";
import { ReportArticle, ReportArticleSchema } from "src/report-articles/schema/report-article.schema";
import { Follow, FollowSchema } from "src/follow/schema/follow.schema";
import { FriendRequest, FriendRequestSchema } from "src/friend-request/schema/friend-request.schema";
import { Chat, ChatSchema } from "src/chat/schema/chat.schema";
import { Message, MessageSchema } from "src/chat/schema/message.schema";

export const schemas = [
  { name: User.name, schema: UserSchema },
  { name: ResetCode.name, schema: ResetCodeSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Article.name, schema: ArticleSchema },
  { name: ArticleBlock.name, schema: ArticleBlockSchema },
  { name: SavedArticle.name, schema: SavedArticleSchema },
  { name: Review.name, schema: ReviewSchema },
  { name: Tag.name, schema: TagSchema },
  { name: ReportReason.name, schema: ReportReasonSchema },
  { name: ReportArticle.name, schema: ReportArticleSchema },
  { name: Follow.name, schema: FollowSchema },
  { name: FriendRequest.name, schema: FriendRequestSchema },
  { name: Chat.name, schema: ChatSchema },
  { name: Message.name, schema: MessageSchema },
]


