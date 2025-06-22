import { Sequelize } from 'sequelize-typescript';
import { Contact } from '../models/Contact';
import dotenv from 'dotenv';
dotenv.config(); 
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [Contact],
});

export default sequelize;