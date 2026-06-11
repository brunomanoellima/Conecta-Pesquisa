import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const useSSL = process.env.DB_SSL === 'true';

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);
