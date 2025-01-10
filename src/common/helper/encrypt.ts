import * as crypto from "crypto"

export function encrypt(str: string, iv: Buffer = crypto.randomBytes(16)) {
  const secretKey = process.env.AES_SECRET_KEY;
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);

  let encryptedStr = cipher.update(str, 'utf8', 'hex');
  encryptedStr += cipher.final('hex');

  return {
    encryptedStr,
    iv: iv.toString('hex'),
  };
}