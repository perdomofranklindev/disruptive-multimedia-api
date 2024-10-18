import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth-routes';
import roleRoutes from './modules/role/role-routes';
import { PORT } from './shared/environment';
import { prepareUserSessionMiddleware } from './shared/middlewares/middlewares';

const app: Express = express();

app.use(express.json());
// eslint-disable-next-line
app.use(cookieParser());
app.use(prepareUserSessionMiddleware);

app.use('/api', authRoutes);
app.use('/api', roleRoutes);

app.listen(PORT, function () {
	console.log(`🚀 Server ready on port ${PORT}`);
});
