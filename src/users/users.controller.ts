import { Body, Controller, Get, Param, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsAuth } from 'src/common/decorators/is-auth.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';
import { ParseMongoIdPipe } from 'src/common/pipe/parse-mongo-id.pipe';
import { Types } from 'mongoose';
import { IsOptionalAuth } from 'src/common/decorators/is-optional-auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UpdateProfileInfoDto } from './dto/update-profile-info.dto';


@Controller({ version: "1" })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Patch("preferences")
  @IsAuth()
  @UseInterceptors(WrapResponseInterceptor)
  updatePreferences(@Body() updatePreferencesDto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(updatePreferencesDto)
  }


  @Get("writer/:id")
  @IsOptionalAuth()
  getWriterProfile(@Param("id", ParseMongoIdPipe) writerId: Types.ObjectId) {
    return this.usersService.writerProfile(writerId);
  }


  @Get("profile-stats")
  @IsAuth()
  getUserProfileStats() {
    return this.usersService.getUserProfileStats();
  }


  @Patch("change-profile-image")
  @IsAuth()
  @UseInterceptors(
    FileInterceptor("picture", {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only images allowed"), false);
        }
        cb(null, true);
      },
    })
  )
  changeImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.changeProfileImage(file);
  }


  @Patch("profile-info")
  @IsAuth()
  updateProfileInfo(@Body() updateProfileInfoDto: UpdateProfileInfoDto) {
    return this.usersService.updateProfileInfo(updateProfileInfoDto);
  }



  




}
