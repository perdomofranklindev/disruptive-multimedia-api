import { Response, NextFunction, Request } from 'express';
import { Cookies, RequestWithSession } from './middlewares-types';
import { JWT_SECRET, REFRESH_SECRET } from '../environment';
import { User } from '../types/generated';
import jwt, { VerifyErrors } from 'jsonwebtoken';

const prepareUserSession = (
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

const checkAuthorization = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	if (!req.session.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	next();
};

const verifyToken = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	const accessToken = (req.cookies as Cookies).access_token;
	const refreshToken = (req.cookies as Cookies).refresh_token;

	if (!accessToken || !refreshToken) {
		res.status(401).send('Unauthorized');
	}

	try {
		const decodedAccessToken = jwt.verify(accessToken, JWT_SECRET);
		req.session.user = decodedAccessToken as Partial<User>;
		next();
	} catch (error) {
		const err = error as VerifyErrors;
		const isOtherError = err.name !== 'TokenExpiredError';

		if (isOtherError) {
			res.status(401).send('Invalid access token');
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
			next();
		} catch (refreshError) {
			const refreshErr = refreshError as VerifyErrors;
			const refreshGotExpired = refreshErr.name === 'TokenExpiredError';

			if (refreshGotExpired) {
				res.status(403).send('Refresh token expired, please log in again');
			}

			res.status(401).send('Invalid refresh token');
		}
	}
};

// Simplify usage.

const prepareUserSessionMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => prepareUserSession(req as RequestWithSession, res, next);

const checkAuthorizationMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => checkAuthorization(req as RequestWithSession, res, next);

const verifyTokenMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => verifyToken(req as RequestWithSession, res, next);

const authMiddlewares = [checkAuthorizationMiddleware, verifyTokenMiddleware];

export { prepareUserSessionMiddleware, authMiddlewares };
