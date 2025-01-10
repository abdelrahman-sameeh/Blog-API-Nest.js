import { ResetCode, resetCodeSchema } from "./reset-code.schema";
import { User, userSchema } from "./user.schema";

export const getSchemas = () => [
  { name: User.name, schema: userSchema },
  { name: ResetCode.name, schema: resetCodeSchema },
]

export class Base {
  _id: string;
  createdAt: Date;
  updatedAt: Date
}