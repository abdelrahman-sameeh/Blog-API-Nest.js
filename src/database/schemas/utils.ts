import { User, userSchema } from "src/users/schema/user.schema";
import { ResetCode, resetCodeSchema } from "./reset-code.schema";

export const getSchemas = () => [
  { name: User.name, schema: userSchema },
  { name: ResetCode.name, schema: resetCodeSchema },
]

export class Base {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date
}