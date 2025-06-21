import { Sequelize } from 'sequelize-typescript';
import { Contact } from '../models/Contact';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'bitespeed',
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  models: [Contact],
});

export default sequelize;