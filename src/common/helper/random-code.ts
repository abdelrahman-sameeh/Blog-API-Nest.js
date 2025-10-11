export const generateCode = (count: number): string => {
  if (count < 1) {
    throw new Error("Count must be at least 1");
  }

  let code = "";

  for (let i = 0; i < count; i++) {
    const random = Math.floor(Math.random() * 10) ;
    code += random;
  }
  
  return code;
};
