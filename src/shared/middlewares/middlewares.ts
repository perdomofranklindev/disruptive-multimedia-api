import { Response, NextFunction, Request } from 'express';
import { Cookies, RequestWithSession } from './middlewares-types';
import { JWT_SECRET, REFRESH_SECRET } from '../environment';
import { User } from '../types/generated';
import jwt, { VerifyErrors } from 'jsonwebtoken';

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

export const _verifyToken = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	const accessToken = (req.cookies as Cookies).access_token;
	const refreshToken = (req.cookies as Cookies).refresh_token;

	if (!accessToken || !refreshToken) {
		return res.status(401).send('Unauthorized');
	}

	try {
		const decodedAccessToken = jwt.verify(accessToken, JWT_SECRET);
		req.session.user = decodedAccessToken as Partial<User>;
		next();
	} catch (error) {
		const err = error as VerifyErrors;

		if (err.name !== 'TokenExpiredError') {
			return res.status(401).send('Invalid access token');
		}

		try {
			const decodedRefreshToken = jwt.verify(
				refreshToken,
				REFRESH_SECRET
			) as Partial<User>;
			const newAccessToken = jwt.sign({ ...decodedRefreshToken }, JWT_SECRET, {
				expiresIn: '1h'
			});

			res.cookie('access_token', newAccessToken, {
				httpOnly: true,
				maxAge: 3600 * 1000 // 1 hour
			});

			req.session.user = decodedRefreshToken;
			return next();
		} catch (refreshError) {
			const refreshErr = refreshError as VerifyErrors;

			if (refreshErr.name === 'TokenExpiredError') {
				return res
					.status(403)
					.send('Refresh token expired, please log in again');
			}

			return res.status(401).send('Invalid refresh token');
		}
	}
};
