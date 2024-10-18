import { Response, NextFunction } from 'express';
import { Cookies, RequestWithSession } from './middlewares-types';
import { JWT_SECRET } from '../environment';
import { User } from '../types/generated';
import jwt from 'jsonwebtoken';

export const prepareUserSessionMiddleware = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	const token = (req.cookies as Cookies).access_token;
	req.session.user = null;

	try {
		const data = jwt.verify(token, JWT_SECRET);
		req.session.user = data as Partial<User>;
	} catch (err) {
		// Handle error
	}

	next();
};
