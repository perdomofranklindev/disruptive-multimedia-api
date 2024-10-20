import { ZodError } from 'zod';
import { User } from '../../shared/types/generated';
import { handleTryCatch } from '../../shared/utils';
import { SignInSchema, SignUpSchema } from './auth-schemas';
import { PRISMA } from '../../shared/prisma-singleton';
import {
	JWT_SECRET,
	REFRESH_SECRET,
	SALT_ROUNDS
} from '../../shared/environment';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
	ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN
} from '../session/session-constants';
import { SessionTokenPayload } from '../session/session-types';

type UserSearchParams = Partial<Pick<User, 'email' | 'username'>>;
type UserCreationParams = Pick<
	User,
	'email' | 'username' | 'password' | 'roleId'
>;
type ValidatePasswordParams = {
	currentPassword: string;
	incomingPassword: string;
};
type FindUserReturn = {
	id: string;
	username: string;
	email: string;
	password: string;
} | null;

export class AuthUtils {
	/**
	 * @description - Validates the sign up schema.
	 * @param {User} user - User.
	 * @returns {Promise<ZodError>} - Validation schema errors.
	 */
	static async validateSignUpSchema(user: User): Promise<ZodError | null> {
		const validationSchemaError = (
			await handleTryCatch(SignUpSchema.parseAsync(user))
		)[1];

		return validationSchemaError as ZodError;
	}

	/**
	 * @description - Checks if a user exists.
	 * @param {UserSearchParams} params - User search params.
	 * @param {string} params.email - User email.
	 * @param {string} params.username - User username.
	 * @throws {Error} - If neither email nor username are provided.
	 * @returns {Promise<boolean>} - User exists.
	 */
	static async userExists({
		email,
		username
	}: UserSearchParams): Promise<boolean> {
		if (!email && !username) {
			throw new Error('Either email or username must be provided.');
		}

		const [user] = await handleTryCatch(
			PRISMA.user.findUnique({
				where: {
					email,
					username
				}
			})
		);

		return Boolean(user);
	}

	/**
	 * @description - Checks if a role exists.
	 * @param {string} roleId - Role id
	 * @returns {Promise<boolean>} - Role exists.
	 */
	static async roleExists(roleId: string): Promise<boolean> {
		const [role] = await handleTryCatch(
			PRISMA.role.findUnique({
				where: {
					id: roleId
				}
			})
		);

		return Boolean(role);
	}

	/**
	 * @description - Creates a user.
	 * @param {UserCreationParams} params - UserCreationParams.
	 * @param {string} params.username - User username.
	 * @param {string} params.email - User email.
	 * @param {string} params.password - User password.
	 * @param {string} params.roleId - Role id.
	 * @returns {Promise<[User | null, Error | null]>} - User data or an error.
	 */
	static async createUser({
		username,
		email,
		password,
		roleId
	}: UserCreationParams): Promise<[User | null, Error | null]> {
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		return handleTryCatch(
			PRISMA.user.create({
				data: {
					username: username,
					email: email,
					password: hashedPassword,
					role: {
						connect: {
							id: roleId
						}
					}
				}
			})
		);
	}

	/**
	 * @description - Validates the sign in schema.
	 * @param {User} user - User.
	 * @returns {Promise<ZodError | null>} - Validation schema errors.
	 */
	static async validateSignInSchema(user: User): Promise<ZodError | null> {
		const validationSchemaError = (
			await handleTryCatch(SignInSchema.parseAsync(user))
		)[1];

		return validationSchemaError as ZodError;
	}

	/**
	 * @description - Finds a user by email or username.
	 * @param params - User search params.
	 * @param {string} params.email - User email.
	 * @param {string} params.username - User username.
	 * @throws {Error} - If neither email nor username are provided.
	 * @returns {Promise<FindUserReturn>} - User data.
	 */
	static async findUser({
		email,
		username
	}: UserSearchParams): Promise<FindUserReturn> {
		if (!email && !username) {
			throw new Error('Either email or username must be provided.');
		}

		return PRISMA.user.findUnique({
			where: {
				email,
				username
			},
			select: {
				id: true,
				email: true,
				username: true,
				password: true
			}
		});
	}

	/**
	 * @description - Validates the password.
	 * @param {ValidatePasswordParams} params - Validate password params.
	 * @param {string} params.currentPassword - Current password.
	 * @param {string} params.incomingPassword - Incoming password.
	 * @returns {boolean} - Password is valid.
	 */
	static isValidPassword({
		currentPassword,
		incomingPassword
	}: ValidatePasswordParams) {
		return bcrypt.compareSync(String(incomingPassword), currentPassword);
	}

	/**
	 * @description - Generates a token.
	 * @param {SessionTokenPayload} user - User.
	 * @returns {string} - Token.
	 */
	static generateAccessToken(user: SessionTokenPayload): string {
		return jwt.sign({ ...user }, JWT_SECRET, {
			expiresIn: ACCESS_TOKEN_EXPIRES_IN
		});
	}

	/**
	 * The function generates a refresh token using the user data and a secret key with a 7-day
	 * expiration.
	 * @param {Partial<User>} user - The `user` parameter is a partial object of type `User`, which likely contains some
	 * user information such as username, email, and other relevant details.
	 * @returns {string} A refresh token is being returned. It is generated by signing the user data with a secret
	 * key and setting an expiration time of 7 days.
	 */
	static generateRefreshToken(user: SessionTokenPayload): string {
		return jwt.sign({ ...user }, REFRESH_SECRET, {
			expiresIn: REFRESH_TOKEN_EXPIRES_IN
		});
	}

	static generateTokens(user: SessionTokenPayload): [string, string] {
		const accessToken = this.generateAccessToken(user);
		const refreshToken = this.generateRefreshToken(user);

		return [accessToken, refreshToken];
	}

	/**
	 * This TypeScript function asynchronously changes a user's password in a database using provided
	 * username or email.
	 * @param  - The `changePassword` function is an asynchronous function that takes in an object as its
	 * parameter. The object should have the following properties:
	 * @returns The `changePassword` function returns an array containing two elements - `updatedUser` and
	 * `error`.
	 */
	static async changePassword({
		username,
		email,
		password
	}: {
		username?: string;
		email?: string;
		password: string;
	}) {
		if (!email && !username) {
			throw new Error('Either email or username must be provided.');
		}

		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		const [updatedUser, error] = await handleTryCatch(
			PRISMA.user.update({
				where: {
					username,
					email
				},
				data: {
					password: hashedPassword
				}
			})
		);

		return [updatedUser, error];
	}
}
