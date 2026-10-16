import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './modules/auth/auth.routes';
import urlsRouter from './modules/urls/urls.routes';
import adminRouter from './modules/admin/admin.routes';
import usersRouter from './modules/users/users.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/urls', urlsRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.get('/:shortCode', urlsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
