import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth-routes';
import roleRoutes from './modules/role/role-routes';
import { PORT } from './shared/environment';

const app: Express = express();

app.use(express.json());
app.use(bodyParser.json()); // We might get rid of that body parser.

// eslint-disable-next-line
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', roleRoutes);

app.listen(PORT, function () {
	console.log(`🚀 Server ready on port ${PORT}`);
});
