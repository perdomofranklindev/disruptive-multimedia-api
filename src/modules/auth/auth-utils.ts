import { ZodError } from 'zod';
import { User } from '../../shared/types/generated';
import { handleTryCatch } from '../../shared/utils';
import { SignUpSchema } from './auth-schemas';
import { PRISMA } from '../../shared/prisma-singleton';
import { JWT_SECRET, SALT_ROUNDS } from '../../shared/environment';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
	static async validateSignUpSchema(user: User): Promise<ZodError> {
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

		return Boolean(
			await PRISMA.user.findUnique({
				where: {
					email,
					username
				}
			})
		);
	}

	/**
	 * @description - Checks if a role exists.
	 * @param {string} roleId - Role id
	 * @returns {Promise<boolean>} - Role exists.
	 */
	static async roleExists(roleId: string): Promise<boolean> {
		return Boolean(
			await PRISMA.role.findUnique({
				where: {
					id: roleId
				}
			})
		);
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
	 * @returns {Promise<ZodError>} - Validation schema errors.
	 */
	static async validateSignInSchema(user: User) {
		const validationSchemaError = (
			await handleTryCatch(SignUpSchema.parseAsync(user))
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
		return bcrypt.compareSync(currentPassword, String(incomingPassword));
	}

	/**
	 * @description - Generates a token.
	 * @param user - User.
	 * @returns {string} - Token.
	 */
	static generateToken(user: Partial<User>): string {
		return jwt.sign({ ...user }, JWT_SECRET, {
			expiresIn: '1h'
		});
	}
}
