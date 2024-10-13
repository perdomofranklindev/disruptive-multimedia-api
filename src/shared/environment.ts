import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT ?? 3000;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);