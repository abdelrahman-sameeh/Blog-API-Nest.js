
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { UserRoles } from '../../common/enums/user-roles.enum';


@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  picture: string;

  @Prop({ enum: UserRoles, default: UserRoles.user })
  role: UserRoles;

  @Prop({ required: true })
  password: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export type UserType = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
