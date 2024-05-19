import { PORT } from './shared/constants';
import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
	res.send('Hello Worlds');
});

app.listen(PORT, function () {
	console.log(`🚀 Server ready on port ${PORT}`);
});
