import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ArticleService } from 'src/articles/services/articles.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ArticleService],
})
export class ReviewModule {}
