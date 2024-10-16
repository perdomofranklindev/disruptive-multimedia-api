import express, { Request, Response, Router } from 'express';
import { User } from '@prisma/client';
import { AuthUtils } from './auth-utils';
import { ENVIRONMENT } from '../../shared/environment';
import { authorizationMiddleware } from '../../shared/middlewares/middlewares';
import { handleTryCatch } from '../../shared/utils';
import { ChangePasswordSchema } from './auth-schemas';
import { ZodError } from 'zod';
import { RequestWithSession } from '../../shared/middlewares/middlewares-types';

const router: Router = express.Router();

router.post('/sign-up', async (request: Request, response: Response) => {
	const user = request.body as User;
	const validatedSchema = await AuthUtils.validateSignUpSchema(user);

	if (validatedSchema?.errors?.length) {
		validatedSchema.errors.forEach((issue) => {
			response.status(400).json({ message: issue.message });
		});
	}

	const { email, username, password, roleId } = user;

	const userExists = await AuthUtils.userExists({
		email,
		username
	});

	if (userExists) {
		response.status(400).json({
			message: 'User already exists'
		});
	}

	const roleExists = await AuthUtils.roleExists(roleId);
	const roleDoesNotExist = !roleExists;

	if (roleDoesNotExist) {
		response.status(400).json({
			message: 'Role does not exist'
		});
	}

	const [newUser, createUserError] = await AuthUtils.createUser({
		username,
		email,
		password,
		roleId
	});

	if (createUserError) {
		response.status(400).json({ message: 'Unexpected error' });
	}

	response.status(201).json({
		id: newUser?.id,
		username: newUser?.username,
		email: newUser?.email
	});
});

router.post('/sign-in', async (request: Request, response: Response) => {
	const data = request.body as User;

	// Validate the user.

	const validatedSchema = await AuthUtils.validateSignInSchema(data);

	if (validatedSchema?.errors?.length) {
		validatedSchema.errors.forEach((issue) => {
			response.status(400).json({ message: issue.message });
		});
	}

	const { email, username, password } = data;

	const user = await AuthUtils.findUser({
		email,
		username
	});

	const userExists = await AuthUtils.userExists({
		email,
		username
	});
	const userDoesNotExist = !userExists;

	if (userDoesNotExist) {
		response.status(400).json({
			message: 'User does not exist'
		});
	}

	const isValidPassword = AuthUtils.isValidPassword({
		currentPassword: user?.password || '',
		incomingPassword: password
	});
	const notValidPassword = !isValidPassword;

	if (notValidPassword) {
		response.status(401).json({
			message: 'Invalid password'
		});
	}

	// Generate tokens.

	const token = AuthUtils.generateToken({
		id: user?.id,
		username,
		email
	});
	const refreshToken = AuthUtils.generateRefreshToken({
		id: user?.id,
		username,
		email
	});

	const oneHour = 1000 * 60 * 60;
	const oneDay = oneHour * 24;
	const sevenDays = oneDay * 7;

	response.cookie('access_token', token, {
		httpOnly: true,
		secure: ENVIRONMENT === 'production',
		sameSite: 'strict',
		maxAge: oneHour
	});
	response.cookie('refresh_access_token', refreshToken, {
		httpOnly: true,
		secure: ENVIRONMENT === 'production',
		sameSite: 'strict',
		maxAge: sevenDays
	});

	response.status(200).json({
		...user
	});
});

router.post('/sign-out', (request: Request, response: Response) => {
	response.clearCookie('access_token');
	response.clearCookie('refresh_access_token');
	response.status(200).json({ message: 'Logout successful' });
});

router.post(
	'/change-password',
	authorizationMiddleware,
	async (request: Request, response: Response) => {
		const data = request.body as { password: string };

		const session = (request as RequestWithSession).session;

		const validatedSchema = (
			await handleTryCatch(ChangePasswordSchema.parseAsync(data))
		)[1] as ZodError;

		if (validatedSchema?.errors?.length) {
			validatedSchema.errors.forEach((issue) => {
				response.status(400).json({ message: issue.message });
			});
		}

		const error = (
			await AuthUtils.changePassword({
				...session.user,
				password: data.password
			})
		)[1];

		if (error) {
			response.status(400).json({ message: 'Unexpected error' });
		}

		response.status(200).json({ message: 'Password changed' });
	}
);

export default router;
