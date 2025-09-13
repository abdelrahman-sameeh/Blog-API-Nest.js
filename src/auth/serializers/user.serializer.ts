import { Exclude, Expose } from 'class-transformer';

export class UserSerializer {
  @Expose()
  _id: any;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Exclude()
  password: string;

  constructor(partial?: Partial<UserSerializer>) {
    Object.assign(this, partial);
  }

}
