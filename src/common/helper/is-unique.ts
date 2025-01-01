import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';

export const isUnique = async (model: Model<any>, field: string, value: string): Promise<void> => {
  const existing = await model.findOne({ [field]: value });
  if (existing) {
    throw new HttpException(`${field} is already exist`, HttpStatus.CONFLICT);  
  }
};
