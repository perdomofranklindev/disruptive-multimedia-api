import express, { Express } from 'express';
import bodyParser from 'body-parser';
import authRoutes from './modules/auth/auth-route';
import roleRoutes from './modules/role/role-route';
import { PORT } from './shared/environment';

const app: Express = express();

app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api', roleRoutes);

app.listen(PORT, function () {
	console.log(`🚀 Server ready on port ${PORT}`);
});
