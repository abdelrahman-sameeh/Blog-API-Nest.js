import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvInterface } from 'src/common/interfaces/env.interface';
import { schemas } from './schemas/utils';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvInterface>) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(schemas)
  ],
  exports: [MongooseModule]
})

export class DatabaseModule { }
