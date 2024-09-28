// import { PORT } from './shared/constants';
import express, { Express } from 'express';
import userRoutes from './modules/auth/auth-route';

const app: Express = express();

app.use('/api', userRoutes);

app.listen(3000, function () {
	console.log(`🚀 Server ready on port ${3000}`);
});
