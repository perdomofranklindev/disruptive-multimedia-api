import express, { Router } from 'express';
import { authMiddlewares } from '../../shared/middlewares/middlewares';
import { AuthController } from './auth-controller';

const router: Router = express.Router();

router.post('/sign-up', AuthController.SignUp);
router.post('/sign-in', AuthController.SignIn);
router.post('/sign-out', AuthController.SignOut);
router.post('/change-password', authMiddlewares, AuthController.ChangePassword);

export default router;
