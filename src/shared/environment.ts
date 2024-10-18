import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT ?? 3000;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
export const JWT_SECRET = String(process.env.JWT_SECRET);
export const REFRESH_JWT_SECRET = String(process.env.REFRESH_JWT_SECRET);
export const ENVIRONMENT = process.env.ENVIRONMENT;
