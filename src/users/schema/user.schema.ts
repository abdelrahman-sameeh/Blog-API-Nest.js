
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRoles } from '../../common/enums/user-roles.enum';


@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ enum: UserRoles, default: UserRoles.user })
  role: UserRoles

  @Prop({ required: true })
  password: string;
}

export type UserType = HydratedDocument<User>;
export const userSchema = SchemaFactory.createForClass(User);
