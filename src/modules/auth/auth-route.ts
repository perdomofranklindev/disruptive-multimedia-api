import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PRISMA } from '../../shared/prisma-singleton';
import { SALT_ROUNDS } from '../../shared/environment';
import { SignUpSchema } from './auth-validation';
import { validateRequestBody } from '../../shared/middlewares';
import { ZodError } from 'zod';
import { handleTryCatch } from '../../shared/utils';

const router: Router = express.Router();

router.post(
	'/sign-up',
	validateRequestBody,
	async (req: Request, res: Response) => {
		const { username, email, password, roleId } = req.body as User;

		// Schema validation.

		const validationSchemaError = (
			await handleTryCatch(
				SignUpSchema.parseAsync({
					username,
					email,
					password,
					roleId
				})
			)
		)[1];

		if (validationSchemaError) {
			if (validationSchemaError instanceof ZodError) {
				validationSchemaError.errors.forEach((issue) => {
					res.status(400).json({ message: issue.message });
				});
			} else {
				res.status(400).json({ message: 'Unexpected error' });
			}
		}

		// User exists.

		const userExists = Boolean(
			await PRISMA.user.findUnique({
				where: {
					email,
					username
				}
			})
		);

		if (userExists) {
			res.status(400).json({
				message: 'User already exists'
			});
		}

		// Creation

		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		const [newUser, createUserError] = await handleTryCatch(
			PRISMA.user.create({
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
			})
		);

		if (createUserError) {
			res.status(400).json({ message: 'Unexpected error' });
		}

		res.status(201).json({
			id: newUser?.id,
			username: newUser?.username,
			email: newUser?.email
		});
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
