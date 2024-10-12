import express, { Express } from 'express';
import authRoutes from './modules/auth/auth-route';
import { PORT } from './shared/environment';

const app: Express = express();

app.use('/api', authRoutes);

app.listen(PORT, function () {
	console.log(`🚀 Server ready on port ${PORT}`);
});
