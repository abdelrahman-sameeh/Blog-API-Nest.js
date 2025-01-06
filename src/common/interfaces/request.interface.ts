import { UserDocument } from "src/database/schemas/user.schema";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument;
    }
  }
}
