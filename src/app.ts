import { User } from '@prisma/client';
import { PORT } from './shared/constants';
import { PRISMA } from './shared/prisma-instance';
import bcrypt from 'bcrypt';
import express, { Application, Request, Response } from 'express';

const app: Application = express();

// Auth.

app.post('/sign-up', async (req: Request, res: Response) => {
	const { username, email, password, roleId } = req.body as User;

	// Encrypt the password
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	try {
		// Create a new user record in the database
		const newUser = await PRISMA.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				role: {
					connect: {
						id: roleId
					}
				}
			}
		});

		res.status(201).json({
			id: newUser.id,
			username: newUser.username,
			email: newUser.email
		});
	} catch (error) {
		res.status(400).json(error);
	}
});

app.post('/sign-in', () => {});

app.post('/sign-out', () => {});

app.post('/forgot-password', () => {});

app.listen(PORT, function () {
	console.log(`🚀 Server ready on port ${PORT}`);
});
