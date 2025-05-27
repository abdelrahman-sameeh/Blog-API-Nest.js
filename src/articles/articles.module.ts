import { Module } from "@nestjs/common";
import { ArticleController } from "./controllers/articles.controller";
import { ArticleService } from "./services/articles.service";
import { ArticleBlockController } from "./controllers/article-block.controller";
import { ArticleBlockService } from "./services/article-block.service";



@Module({
  controllers: [ArticleController, ArticleBlockController],
  providers: [ArticleService, ArticleBlockService]
})
export class ArticleModule { }


