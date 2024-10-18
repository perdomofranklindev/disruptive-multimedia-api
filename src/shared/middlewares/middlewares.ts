import { Response, NextFunction, Request } from 'express';
import { Cookies, RequestWithSession } from './middlewares-types';
import { JWT_SECRET } from '../environment';
import { User } from '../types/generated';
import jwt from 'jsonwebtoken';

const _prepareUserSessionMiddleware = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	const token = (req.cookies as Cookies).access_token;
	req.session = { user: null };

	try {
		const data = jwt.verify(token, JWT_SECRET);
		req.session.user = data as Partial<User>;
	} catch (err) {
		// Handle error
	}

	next();
};

export const prepareUserSessionMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => _prepareUserSessionMiddleware(req as RequestWithSession, res, next);

const _authorizationMiddleware = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	if (!req.session.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	next();
};

export const authorizationMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => _authorizationMiddleware(req as RequestWithSession, res, next);
