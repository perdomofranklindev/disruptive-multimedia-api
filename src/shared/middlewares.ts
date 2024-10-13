import { NextFunction, Request, Response } from 'express';

export const validateRequestBody = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (typeof req.body === 'undefined') {
		return res.status(400).json({
			message: 'Request body is required'
		});
	}

	next();
};
