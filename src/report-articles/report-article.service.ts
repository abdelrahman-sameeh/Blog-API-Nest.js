import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ReportReason } from "./schema/report-reason.schema";
import { Model, Types } from "mongoose";
import { ReportArticle } from "./schema/report-article.schema";
import { fakeReasons } from "src/database/seeders/report-reasons.fake";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { CreateReportDto } from "./dto/create-report.dto";
import { Article } from "src/articles/schemas/article.schema";
import { Tag } from "src/tags/schema/tag.schema";
import { ChangeReportStatusDto } from "./dto/change-report-status.dto";


@Injectable()
export class ReportArticleService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(ReportArticle.name) private readonly reportArticleModel: Model<ReportArticle>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ReportReason.name) private readonly reportReasonModel: Model<ReportReason>
  ) { }


  async createFakeReasons() {
    for (const reason of fakeReasons) {
      const existReason = await this.reportReasonModel.findOne({ reason: reason.label?.toLowerCase() });

      if (!existReason) {
        await this.reportReasonModel.create({ reason: reason.label.toLowerCase() });
      }
    }
    return { message: "success" }
  }

  async getReasons(){
    return this.reportReasonModel.find()
  }


  async createReport(articleId: Types.ObjectId, createReportDto: CreateReportDto) {
    const article = await this.articleModel.findById(articleId);
    if (!article) {
      throw new NotFoundException("article not found");
    }

    const data = {
      ...createReportDto,
      reason: new Types.ObjectId(createReportDto.reason),
      reporter: this.request.user._id,
      article: articleId
    }
    const report = await this.reportArticleModel.create(data);
    return report;
  }


  async getArticleReports(articleId: Types.ObjectId) {
    const article = await this.articleModel.findById(articleId, "-createdAt -updatedAt -likes")
      .populate([
        { path: "user", select: "firstName lastName picture" },
        { path: "category", select: "title" },
        { path: "tags", model: Tag.name, select: "title" },
      ]);

    const reports = await this.reportArticleModel.aggregate([
      {
        $match: { article: new Types.ObjectId(articleId) },
      },
      {
        $addFields: {
          isPending: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          isPending: -1,   // الأول الـ pending
          createdAt: -1,   // بعد كده الأحدث
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reporter",
          foreignField: "_id",
          as: "reporter",
        },
      },
      {
        $unwind: "$reporter",
      },
      {
        $lookup: {
          from: "reportreasons",
          localField: "reason",
          foreignField: "_id",
          as: "reason",
        },
      },
      {
        $unwind: "$reason",
      },
      {
        $project: {
          reporter: {
            firstName: 1,
            lastName: 1,
            picture: 1,
          },
          reason: {
            _id: 1,
            reason: 1
          },
          status: 1,
          description: 1,
          createdAt: 1
        },
      },
    ]);

    return {
      article,
      reports
    }
  }


  async getReports(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await this.reportArticleModel.aggregate([
      // ✅ نجمع كل البلاغات حسب المقال
      {
        $group: {
          _id: "$article",
          reportsCount: { $sum: 1 },
          numberOfPendingReports: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          latestCreatedAt: { $max: "$createdAt" } // نجيب أحدث تاريخ تقرير للمقال
        },
      },

      // ✅ نرتب الأولوية: المقالات اللي فيها pending الأول
      { $sort: { hasPending: -1, latestCreatedAt: -1 } },

      // ✅ نعمل pagination
      { $skip: skip },
      { $limit: limit },

      // ✅ نجيب بيانات المقال نفسه
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "_id",
          as: "article",
        },
      },
      { $unwind: "$article" },

      {
        $lookup: {
          from: "reportarticles", // نفس collection اللي فيه البلاغات
          let: { articleId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$article", "$$articleId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                status: 1,
                reason: 1,
                createdAt: 1,
              },
            },
          ],
          as: "lastReport",
        },
      },
      { $unwind: "$lastReport" },

      // // ✅ نجيب بيانات الـuser (صاحب المقال)
      {
        $lookup: {
          from: "users",
          localField: "article.user",
          foreignField: "_id",
          as: "article.user",
        },
      },
      { $unwind: "$article.user" },

      // ✅ نحدد الحقول اللي نرجعها
      {
        $project: {
          _id: 0,
          reportsCount: 1,
          numberOfPendingReports: 1,
          lastReport: 1,
          article: {
            _id: 1,
            title: 1,
            createdAt: 1,
            user: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              picture: 1,
            },
          },
        },
      },
    ]);

    const total = await this.reportArticleModel.distinct("article").then(a => a.length);

    return {
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: reports,
    };
  }


  async changeReportStatus(reportId: Types.ObjectId, changeReportStatusDto: ChangeReportStatusDto) {
    const report = await this.reportArticleModel.findByIdAndUpdate(reportId, changeReportStatusDto, { new: true });
    if (!report) {
      throw new NotFoundException("report not found");
    }
    return report;
  }

}

