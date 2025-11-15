import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { ReportArticleService } from "./report-article.service";
import { IsAuth } from "src/common/decorators/is-auth.decorator";
import { CreateReportDto } from "./dto/create-report.dto";
import { ParseMongoIdPipe } from "src/common/pipe/parse-mongo-id.pipe";
import { Types } from "mongoose";
import { ChangeReportStatusDto } from "./dto/change-report-status.dto";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response.interceptor";


@Controller({ version: "1" })
export class ReportArticleController {

  constructor(private readonly reportArticleService: ReportArticleService) { }


  @Post("fake-reasons")
  @Roles("admin")
  createFakeReasons() {
    return this.reportArticleService.createFakeReasons();
  }


  @Get("reasons")
  @UseInterceptors(WrapResponseInterceptor)
  @IsAuth()
  getReasons(){
    return this.reportArticleService.getReasons();
  }

  @Post("article/:id/report")
  @IsAuth()
  createReport(@Param("id", ParseMongoIdPipe) articleId: Types.ObjectId, @Body() createReportDto: CreateReportDto) {
    return this.reportArticleService.createReport(articleId, createReportDto);
  }



  @Get("article/:id/reports")
  @Roles("admin")
  getArticleReports(@Param("id", ParseMongoIdPipe) articleId: Types.ObjectId) {
    return this.reportArticleService.getArticleReports(articleId);
  }


  @Get("reports/summary")
  @Roles("admin")
  getReports(@Query() query: any) {
    return this.reportArticleService.getReports(query);
  }


  @Patch("report/:id")
  @Roles("admin")
  @UseInterceptors(WrapResponseInterceptor)
  changeReportStatus(@Param("id", ParseMongoIdPipe) reportId: Types.ObjectId, @Body() changeReportStatusDto: ChangeReportStatusDto) {
    return this.reportArticleService.changeReportStatus(reportId, changeReportStatusDto)
  }


}

