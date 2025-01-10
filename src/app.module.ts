import { Module, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AccessGuard } from './auth/guards/access.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvInterface } from './common/interfaces/env.interface';
import { ScheduleModule } from '@nestjs/schedule';

const coreModules = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.NODE_ENV === 'dev' ? './env/dev.env' : './env/prod.env',
  }),
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService<EnvInterface>) => {
      return {
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"Article Verse" <${configService.get<string>("EMAIL_USERNAME")}>`,
        },
      };
    },
    inject: [ConfigService],
  }),
  ScheduleModule.forRoot(),
  DatabaseModule,
  AuthModule,
  UsersModule,
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
