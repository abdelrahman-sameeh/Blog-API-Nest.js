import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schema/review.schema';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Pagination } from 'src/common/helper/pagination';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class ReviewService {

  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) { }

  async createReview(user: User, createReviewDto: CreateReviewDto) {
    const numberOfUserReviews = await this.reviewModel.countDocuments({
      article: createReviewDto.article,
      author: user._id,
    });

    if (numberOfUserReviews > 50) {
      throw new BadRequestException("You have reached the maximum number of reviews for this article");
    }

    const newReview = await this.reviewModel.create({
      ...createReviewDto,
      article: new Types.ObjectId(createReviewDto.article),
      author: user._id,
    });

    return newReview;
  }


  async updateReview(reviewId, updateReviewDto: UpdateReviewDto) {
    return await this.reviewModel.findByIdAndUpdate(reviewId, updateReviewDto, { new: true })
  }


  async deleteReview(reviewId) {
    await this.reviewModel.findByIdAndDelete(reviewId)
    return
  }


  async likeComment(user: User, reviewId) {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found");
    }
    if (!review.likes.includes(user._id as any)) {
      review.likes.push(user._id as any)
    }

    return review.save()
  }


  async dislikeComment(user: User, reviewId) {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException("Review not found");
    }
    const index = review.likes.indexOf(user._id as any)
    if (index != -1) {
      review.likes.splice(index, 1)
    }
    return review.save()
  }

  async findArticleReviews(articleId, queryString) {
    const { page, limit } = queryString

    const query = {
      article: articleId
    }

    const populateOptions = [
      { path: "author", select: "firstName lastName" },
    ]

    const paginator = new Pagination(this.reviewModel, query, page, limit, null, populateOptions)
    return await paginator.paginate()
  }


  async createReply(user: User, createReplyDto: CreateReplyDto) {
    const review = await this.reviewModel.findById(createReplyDto.reviewId)
    if (!review) {
      throw new NotFoundException("Parent review not found")
    }
    const reply = await this.reviewModel.create({
      author: user._id,
      content: createReplyDto.content,
      parentReview: new Types.ObjectId(createReplyDto.reviewId)
    })
    return reply
  }


  async findReviewReplies(reviewId) {
    return await this.reviewModel.find({ parentReview: reviewId }).populate({ path: "author", select: "firstName lastName" })
  }

}
