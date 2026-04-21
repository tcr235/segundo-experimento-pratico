import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import studentsRouter from './routes/students';
app.use('/students', studentsRouter);
import classesRouter from './routes/classes';
app.use('/classes', classesRouter);
import evaluationsRouter from './routes/evaluations';
app.use('/evaluations', evaluationsRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});

export default app;
