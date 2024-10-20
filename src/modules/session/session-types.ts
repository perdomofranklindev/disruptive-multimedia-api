import { Request } from 'express';
import { User } from '../../shared/types/generated';

export type SessionTokenPayload = Pick<User, 'id' | 'email' | 'username'>;

export interface Cookies {
	access_token: string;
	refresh_token: string;
}

export interface RequestWithSession extends Request {
	session: {
		user: SessionTokenPayload | null;
	};
}
