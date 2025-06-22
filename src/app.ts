import express from 'express';
import identityRoutes from './routes/identityRoutes';
import sequelize from './config/database';

const app = express();

app.use(express.json());
app.use('v1/api', identityRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;