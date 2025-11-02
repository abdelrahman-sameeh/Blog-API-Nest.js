import { Module } from "@nestjs/common";
import { ReportArticleController } from "./report-article.controller";
import { ReportArticleService } from "./report-article.service";


@Module({
  controllers: [ReportArticleController],
  providers: [ReportArticleService]
})
export class ReportArticleModule {}