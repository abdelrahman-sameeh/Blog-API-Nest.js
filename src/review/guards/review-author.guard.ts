import { CanActivate, ExecutionContext, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "../schema/review.schema";
import { Model } from "mongoose";


export class ReviewAuthor implements CanActivate {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const reviewId = request.params.id
    const user = request.user
    const review = await this.reviewModel.findById(reviewId)
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.author.toString() !== user._id.toString()) {
      throw new UnauthorizedException('You are not the author of this review');
    }

    return true
  }
}
