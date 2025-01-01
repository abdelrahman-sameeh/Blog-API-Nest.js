import * as jwt from 'jsonwebtoken';

export const generateToken = async (payload: object)=> {
  const secretKey = process.env.JWT_SECRET_KEY; 
  const expiresIn = '90d'; 
  return jwt.sign(payload, secretKey, { expiresIn });
};
