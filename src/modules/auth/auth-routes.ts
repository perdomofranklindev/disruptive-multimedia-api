import express, { Request, Response, Router } from 'express';
import { User } from '@prisma/client';
import { validateRequestBody } from '../../shared/middlewares';
import { AuthUtils } from './auth-utils';
import { ENVIRONMENT } from '../../shared/environment';

const router: Router = express.Router();

router.post(
	'/sign-up',
	validateRequestBody,
	async (request: Request, response: Response) => {
		const user = request.body as User;

		const validatedSchema = await AuthUtils.validateSignUpSchema(user);

		if (validatedSchema.errors.length) {
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
	}
);

router.post('/sign-in', async (request: Request, response: Response) => {
	const data = request.body as User;

	const validatedSchema = await AuthUtils.validateSignInSchema(data);

	if (validatedSchema.errors.length) {
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
		currentPassword: user?.password ?? '',
		incomingPassword: password
	});
	const notValidPassword = !isValidPassword;

	if (notValidPassword) {
		response.status(401).json({
			message: 'Invalid password'
		});
	}

	const token = AuthUtils.generateToken({ username, email });

	response
		.status(200)
		.cookie('access_token', token, {
			httpOnly: true,
			secure: ENVIRONMENT === 'production',
			sameSite: 'strict',
			maxAge: 1000 * 60 * 60
		})
		.json({
			email: user?.email,
			username: user?.username,
			token
		});
});

// router.get('/protected', (request: Request, response: Response) => {
// 	const token = request.cookies.access_token;

// 	if (!token) {
// 		return response.status(403).send('Access not authorized');
// 	}

// 	try {
// 		const data = jwt.verify(token, JWT_SECRET);
// 		response.status(200).json({
// 			message: 'Authorized'
// 		});
// 	} catch (error) {
// 		return response.status(401).send('Access not authorized');
// 	}
// });

// router.post('/sign-out', (request: Request, response: Response) => {});

// router.post('/forgot-password', (request: Request, response: Response) => {});

export default router;
