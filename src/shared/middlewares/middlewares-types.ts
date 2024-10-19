import { Request } from 'express';
import { User } from '../types/generated';

export interface Cookies {
	access_token: string;
	refresh_token: string;
}

export interface MiddlewareSession {
	session: {
		user: Pick<User, 'email' | 'username'> | null;
	};
}

export interface RequestWithSession extends Request {
	session: {
		user: Partial<User> | null;
	};
}
