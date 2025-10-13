import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsAuth } from 'src/common/decorators/is-auth.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';

@Controller({version: "1"})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @IsAuth()
  @Patch("preferences")
  @UseInterceptors(WrapResponseInterceptor)
  updatePreferences(@Body() updatePreferencesDto: UpdatePreferencesDto){
    return this.usersService.updatePreferences(updatePreferencesDto)
  }


}
