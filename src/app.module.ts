import { Module, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AccessGuard } from './common/guards/access.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvInterface } from './common/interfaces/env.interface';
import { ScheduleModule } from '@nestjs/schedule';
import { ArticleModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { SavedArticleModule } from './saved-articles/saved-article.module';
import { ReviewModule } from './review/review.module';
import { TagsModule } from './tags/tags.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FilterModule } from './filter/filter.module';
import { ReportArticleModule } from './report-articles/report-article.module';
import { FollowModule } from './follow/follow.module';

const coreModules = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.NODE_ENV === 'dev' ? 'env/dev.env' : 'env/prod.env',
  }),
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService<EnvInterface>) => {
      return {
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get('EMAIL_USERNAME'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"Article Verse" <${configService.get("EMAIL_USERNAME")}>`,
        },
      };
    },
    inject: [ConfigService],
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, "..", 'uploads'),
    serveRoot: "/uploads"
  }),
  ScheduleModule.forRoot(),
  DatabaseModule,
  AuthModule,
  UsersModule,
  ArticleModule,
  CategoriesModule,
  SavedArticleModule,
  ReviewModule,
  TagsModule,
  FilterModule,
  ReportArticleModule,
  FollowModule
];


const coreProviders = [
  {
    provide: APP_PIPE,
    useFactory: () => new ValidationPipe({ transform: true, whitelist: true })
  },
  {
    provide: APP_GUARD,
    useClass: AccessGuard
  }
]

@Module({
  imports: coreModules,
  providers: coreProviders
})
export class AppModule { }
