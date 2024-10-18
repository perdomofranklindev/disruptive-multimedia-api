import { Request } from 'express';
import { User } from '../types/generated';

export interface Cookies {
	access_token: string;
}

export interface MiddlewareSession {
	session: {
		user: Partial<User> | null;
	};
}

export interface RequestWithSession extends Request {
	session: {
		user: Partial<User> | null;
	};
}
