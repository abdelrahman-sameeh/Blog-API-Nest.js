
export function generateUsername(firstName: string): string {
  const prefix = firstName.toLowerCase().slice(0);
  const randomNumber = Math.floor(100000 + Math.random() * 900000); 
  return `${prefix}${randomNumber}`;
}