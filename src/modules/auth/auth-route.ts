import express, { NextFunction, Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PRISMA } from '../../shared/prisma-singleton';
import { SALT_ROUNDS } from '../../shared/environment';
import { SignUpSchema } from './auth-validation';

const router: Router = express.Router();

const validateRequestBody = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (typeof req.body === 'undefined') {
		return res.status(400).json({
			message: 'Request body is required'
		});
	}

	next();
};

router.post(
	'/sign-up',
	validateRequestBody,
	async (req: Request, res: Response) => {
		const { username, email, password, roleId } = req.body as User;

		try {
			SignUpSchema.parse({
				username,
				email,
				password,
				roleId
			});
		} catch (error) {
			res.status(400).json({ message: 'message' });
		}

		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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
	}
);

// router.post('/sign-in', (req: Request, res: Response) => {
// 	res.status(200).json({
// 		message: 'Sign in successfully'
// 	});
// });

// router.post('/sign-out', (req: Request, res: Response) => {});

// router.post('/forgot-password', (req: Request, res: Response) => {});

export default router;
