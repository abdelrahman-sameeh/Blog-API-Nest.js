import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';
import { IsAuth } from 'src/common/decorators/is-auth.decorator';
import { ReviewAuthor } from './guards/review-author.guard';
import { ParseMongoIdPipe } from 'src/common/pipe/parse-mongo-id.pipe';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Controller({ version: '1' })
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post("review")
  @UseInterceptors(WrapResponseInterceptor)
  @IsAuth()
  createReview(@Req() request, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(request.user, createReviewDto)
  }

  @Get("article/:id/review")
  findArticleReviews(@Param("id", ParseMongoIdPipe) articleId, @Query() query){
    return this.reviewService.findArticleReviews(articleId, query)
  }

  
  
  @Patch("review/:id")
  @UseGuards(ReviewAuthor)
  @UseInterceptors(WrapResponseInterceptor)
  @IsAuth()
  updateReview(@Param("id", ParseMongoIdPipe) reviewId, @Body() updateReviewDto: UpdateReviewDto){
    return this.reviewService.updateReview(reviewId, updateReviewDto)
  }
  

  @Delete("review/:id")
  @UseGuards(ReviewAuthor)
  @UseInterceptors(WrapResponseInterceptor)
  @IsAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(@Param("id", ParseMongoIdPipe) reviewId){
    return this.reviewService.deleteReview(reviewId)
  }
  
  
  @Patch("review/:id/like")
  @IsAuth()
  likeComment(@Req()request, @Param("id", ParseMongoIdPipe) reviewId){
    return this.reviewService.likeComment(request.user, reviewId)
  }
  
  @Patch("review/:id/dislike")
  @IsAuth()
  dislikeComment(@Req()request, @Param("id", ParseMongoIdPipe) reviewId){
    return this.reviewService.dislikeComment(request.user, reviewId)
  }
  
  
  @Get("review/:id/reply")
  @UseInterceptors(WrapResponseInterceptor)
  findReviewReplies(@Param("id", ParseMongoIdPipe) reviewId){
    return this.reviewService.findReviewReplies(reviewId)
  }

  
  @Post("reply")
  @UseInterceptors(WrapResponseInterceptor)
  @IsAuth()
  createReply(@Req() request, @Body() createReplyDto: CreateReplyDto){
    return this.reviewService.createReply(request.user, createReplyDto)
  }


}
