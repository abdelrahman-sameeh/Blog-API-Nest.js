
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { Category } from 'src/categories/schema/category.schema';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountVisibility } from 'src/common/enums/account-visibility.enum';

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

  @Prop()
  bio: string;

  @Prop({ enum: UserRoles, default: UserRoles.USER })
  role: UserRoles;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [{ ref: Category.name, type: Types.ObjectId }],
    default: []
  })
  preferences: Types.ObjectId[]

  @Prop({ enum: AccountVisibility, default: AccountVisibility.PUBLIC })
  visibility: AccountVisibility

  @Prop({ enum: AccountStatus, default: AccountStatus.NEW })
  status: AccountStatus

  @Prop(
    {
      type: {
        countryCode: { type: String, maxlength: 5 },
        phoneNumber: { type: String, maxlength: 15 },
      }
    }
  )
  phone: {
    countryCode: string;
    phoneNumber: string;
  }


}

export type UserType = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
