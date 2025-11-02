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
import { Pagination } from "src/common/helper/pagination";


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
    const reports = await this.reportArticleModel.find({ article: articleId }, "-createdAt -updatedAt -__v -article")
      .populate([
        { path: "reporter", select: "firstName lastName picture" },
        { path: "reason" },
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

    // تجميع (aggregation pipeline)
    const reports = await this.reportArticleModel.aggregate([
      {
        $group: {
          _id: "$article",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit },

      // 🔹 ربط المقال
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "_id",
          as: "article",
        },
      },
      { $unwind: "$article" },

      // 🔹 ربط الـ user (صاحب المقال)
      {
        $lookup: {
          from: "users",
          localField: "article.user",
          foreignField: "_id",
          as: "article.user",
        },
      },
      { $unwind: "$article.user" },

      // 🔹 ربط الـ category
      {
        $lookup: {
          from: "categories",
          localField: "article.category",
          foreignField: "_id",
          as: "article.category",
        },
      },
      { $unwind: "$article.category" },

      // 🔹 ربط الـ tags (ممكن أكتر من tag)
      {
        $lookup: {
          from: "tags",
          localField: "article.tags",
          foreignField: "_id",
          as: "article.tags",
        },
      },

      // 🔹 تحديد الحقول اللي ترجع
      {
        $project: {
          _id: 0,
          count: 1,
          article: {
            _id: 1,
            title: 1,
            user: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              picture: 1,
            },
            category: {
              _id: 1,
              title: 1,
            },
            tags: {
              _id: 1,
              title: 1,
            },
            createdAt: 1,
          },
        },
      },
    ]);


    const total = await this.reportArticleModel.distinct("article").then(a => a.length);

    return {
      total,
      page,
      limit,
      data: reports,
    };
  }



}

