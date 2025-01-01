import { User, UserSchema } from "./user.schema";

export const getSchemas = () => [
  { name: User.name, schema: UserSchema },
]