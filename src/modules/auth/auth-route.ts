/* eslint-disable */
import bcrypt from 'bcrypt';
import express, { Application, Request, Response } from 'express';
import { User } from '@prisma/client';

const app: Application = express();
const router = express.Router();

app.post('/sign-up', async (req: Request, res: Response) => {
	// const { username, email, password, roleId } = req.body as User;
	// // Encrypt the password
	// const saltRounds = 10;
	// const hashedPassword = await bcrypt.hash(password, saltRounds);
	// try {
	// 	// Create a new user record in the database
	// 	const newUser = await PRISMA.user.create({
	// 		data: {
	// 			username,
	// 			email,
	// 			password: hashedPassword,
	// 			role: {
	// 				connect: {
	// 					id: roleId
	// 				}
	// 			}
	// 		}
	// 	});
	// 	res.status(201).json({
	// 		id: newUser.id,
	// 		username: newUser.username,
	// 		email: newUser.email
	// 	});
	// } catch (error) {
	// 	res.status(400).json(error);
	// }
});

app.post('/sign-in', (req: Request, res: Response) => {});

app.post('/sign-out', (req: Request, res: Response) => {});

app.post('/forgot-password', (req: Request, res: Response) => {});

export default router;
