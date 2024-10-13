import { z } from 'zod';

export const SignUpSchema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters long')
		.max(20, 'Username cannot exceed 20 characters')
		.regex(
			/^@[a-zA-Z0-9_]{3,20}$/,
			'Username must start with @ and can only contain letters, numbers, and underscores'
		)
		.transform((val) => val.toLowerCase()),
	email: z
		.string()
		.email('Please enter a valid email address')
		.transform((val) => val.toLowerCase()),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	roleId: z
		.string()
		.min(1, 'Role ID is required')
		.optional()
		.refine((val) => val !== undefined, 'Role ID is required')
});

export const SignInSchema = z.object({
	email: z.string().email(),
	username: z.string(),
	password: z.string()
});
