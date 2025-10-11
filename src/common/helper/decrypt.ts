import * as crypto from "crypto"

export function decrypt(encryptedCode: string, iv: string): string {
  const secretKey = process.env.AES_SECRET_KEY;
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));

  let decryptedCode = decipher.update(encryptedCode, 'hex', 'utf8');
  decryptedCode += decipher.final('utf8');

  return decryptedCode;
}