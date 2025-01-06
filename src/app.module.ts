import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AccessGuard } from './auth/guards/access.guard';

const coreModules = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.NODE_ENV === 'dev' ? './env/dev.env' : './env/prod.env',
  }),
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
