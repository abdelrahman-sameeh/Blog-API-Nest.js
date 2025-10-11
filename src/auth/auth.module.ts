import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ArticleService } from 'src/articles/services/articles.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ArticleService],
})
export class AuthModule { }
