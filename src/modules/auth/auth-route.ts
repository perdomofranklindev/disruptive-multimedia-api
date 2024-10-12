import bcrypt from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import { User } from '@prisma/client';
import { PRISMA } from '../../shared/prisma-singleton';

const router: Router = express.Router();

router.post('/sign-up', async (req: Request, res: Response) => {
	if (typeof req.body === 'undefined') {
		return res.status(400).json({
			message: 'Request body is required'
		});
	}

	const { username, email, password, roleId } = req.body as User;

	// Encrypt the password
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	try {
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

// router.post('/sign-in', (req: Request, res: Response) => {
// 	res.status(200).json({
// 		message: 'Sign in successfully'
// 	});
// });

// router.post('/sign-out', (req: Request, res: Response) => {});

// router.post('/forgot-password', (req: Request, res: Response) => {});

export default router;
