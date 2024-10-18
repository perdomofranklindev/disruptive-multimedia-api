import { z } from 'zod';

const usernameSchema = z
	.string({ message: 'Username required' })
	.min(3, 'Username must be at least 3 characters long')
	.max(20, 'Username cannot exceed 20 characters')
	.regex(
		/^@[a-zA-Z0-9_]{3,20}$/,
		'Username must start with @ and can only contain letters, numbers, and underscores'
	)
	.transform((val) => val.toLowerCase());

const emailSchema = z
	.string({ message: 'Email required' })
	.email('Please enter a valid email address')
	.transform((val) => val.toLowerCase());

const passwordSchema = z
	.string({ message: 'Password required' })
	.min(8, 'Password must be at least 8 characters long');

export const SignUpSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	password: passwordSchema,
	roleId: z
		.string({
			message: 'Role ID is required'
		})
		.min(1, 'Role ID is required')
});

export const SignInSchema = z
	.object({
		username: usernameSchema.optional(),
		email: emailSchema.optional(),
		password: passwordSchema
	})
	.refine((data) => data.username || data.email, {
		message: 'Either username or email must be provided',
		path: ['username', 'email'] // This ensures the error appears on either field
	});

export const ChangePasswordSchema = z.object({
	password: passwordSchema
});
