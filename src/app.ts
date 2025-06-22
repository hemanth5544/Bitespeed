import express, { Application, Request, Response } from 'express';
import identityRoutes from './routes/identityRoutes';
import sequelize from './config/database';

const app: Application = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

app.use('/v1/api', identityRoutes);

const PORT: number = Number(process.env.PORT) || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
