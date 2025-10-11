import * as jwt from 'jsonwebtoken';
import { UserSerializer } from 'src/auth/serializers/user.serializer';

export const generateToken = async (user: UserSerializer)=> {
  const secretKey = process.env.JWT_SECRET_KEY; 
  const expiresIn = '90d'; 
  const payload = {
    _id: user._id,
    username: user.username
  }
  return jwt.sign(payload, secretKey, { expiresIn });
};
