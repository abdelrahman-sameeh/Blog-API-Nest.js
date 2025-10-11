import { Module } from "@nestjs/common";
import { SavedArticleController } from "./saved-article.controller";
import { SavedArticleService } from "./saved-article.service";


@Module({
  controllers: [SavedArticleController],
  providers: [SavedArticleService]
})
export class SavedArticleModule { }

