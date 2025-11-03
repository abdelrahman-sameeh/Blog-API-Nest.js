import { IsEnum } from "class-validator";
import { Status } from "../schema/report-article.schema";


export class ChangeReportStatusDto{

  @IsEnum(Status)
  status: Status

}