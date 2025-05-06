import { UserDocument } from "src/users/schema/user.schema";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument;
    }
  }
}
