import { ICategory } from "./category.interface";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: "user" | "admin";
  picture: string;
  preferences: ICategory[] | string[];
  visibility: "public" | "private";
  status: "new" | "activate" | "banned" | "blocked" | "deleted"
  bio: string
}
