const { Sequelize } = require('sequelize');
require('dotenv').config();

// Supabase (produção) usa DATABASE_URL; MySQL local usa variáveis individuais
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      pool: { max: 3, min: 0, idle: 10000, acquire: 30000 },
      logging: false
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      port: process.env.DB_PORT || 3306,
      logging: false
    });

module.exports = sequelize;
