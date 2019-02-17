import express from 'express';
import staticRouter from './routers/static';

const app = express();

app.use(staticRouter);

export default app;
