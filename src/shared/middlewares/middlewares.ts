import { Response, NextFunction, Request } from 'express';
import { JWT_SECRET, REFRESH_SECRET } from '../environment';
import { User } from '../types/generated';
import {
	Cookies,
	RequestWithSession,
	SessionTokenPayload
} from '../../modules/session/session-types';
import { AuthUtils } from '../../modules/auth/auth-utils';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { COOKIE_ACCESS_TOKEN_MAX_AGE } from '../../modules/session/session-constants';

const prepareUserSession = (
	req: RequestWithSession,
	res: Response,
	next: NextFunction
) => {
	const token = (req.cookies as Cookies).access_token;
	req.session = { user: null };

	try {
		const data = jwt.verify(token, JWT_SECRET);
		req.session.user = data as SessionTokenPayload;
	} catch (err) {
		// Handle error
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

	// If those token don't exist, then the user is logout.

	if (!accessToken && !refreshToken) {
		res.status(401).send('Unauthorized');
	}

	const handleRefreshToken = () => {
		try {
			const decodedRefreshToken = jwt.verify(
				refreshToken,
				REFRESH_SECRET
			) as User;
			const newAccessToken = AuthUtils.generateAccessToken({
				id: decodedRefreshToken.id,
				email: decodedRefreshToken.email,
				username: decodedRefreshToken.username
			});
			res.cookie('access_token', newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: COOKIE_ACCESS_TOKEN_MAX_AGE
			});

			req.session.user = decodedRefreshToken;
			return next();
		} catch (err) {
			if (err instanceof TokenExpiredError) {
				return res
					.status(401)
					.send('Refresh token expired, please log in again');
			}
			return res.status(401).send('Invalid refresh token');
		}
	};

	// Some browsers or app clients do not return expired cookies

	if (accessToken) {
		try {
			const decodedAccessToken = jwt.verify(
				accessToken,
				JWT_SECRET
			) as SessionTokenPayload;
			req.session.user = decodedAccessToken;
			return next();
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				return handleRefreshToken();
			}
			return res.status(401).send('Invalid access token');
		}
	}

	// So we're assuming that the non-existing of the access token cookie as an expiration of it.

	return handleRefreshToken();
};

// Simplify usage.

const prepareUserSessionMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => prepareUserSession(req as RequestWithSession, res, next);

const verifyTokenMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => verifyToken(req as RequestWithSession, res, next);

const authMiddlewares = [verifyTokenMiddleware];

export { prepareUserSessionMiddleware, authMiddlewares };
