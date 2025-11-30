import { Body, Controller, Get, Param, Patch, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsAuth } from 'src/common/decorators/is-auth.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';
import { ParseMongoIdPipe } from 'src/common/pipe/parse-mongo-id.pipe';
import { Types } from 'mongoose';
import { IsOptionalAuth } from 'src/common/decorators/is-optional-auth.decorator';

@Controller({version: "1"})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch("preferences")
  @IsAuth()
  @UseInterceptors(WrapResponseInterceptor)
  updatePreferences(@Body() updatePreferencesDto: UpdatePreferencesDto){
    return this.usersService.updatePreferences(updatePreferencesDto)
  }


  @Get("writer/:id")
  @IsOptionalAuth()
  getWriterProfile(@Param("id", ParseMongoIdPipe) writerId: Types.ObjectId){
    return this.usersService.writerProfile(writerId);
  }


}
