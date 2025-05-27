import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import mongoose from "mongoose";



export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return new mongoose.Types.ObjectId(value)
    } catch (err) {
      throw new BadRequestException(`invalid mongo id ${value}`)
    }
  }
}
