import express, { Request, Response, Router } from 'express';
import { PRISMA } from '../../shared/prisma-singleton';

const router: Router = express.Router();

router.get('/roles', async (req: Request, res: Response) => {
	const roles = await PRISMA.role.findMany();
	res.status(200).json(roles);
});

export default router;
