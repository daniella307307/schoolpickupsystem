const { Sequelize } = require('sequelize');
const logger = require('./logger');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: (msg) => logger.info(msg)
});

sequelize.authenticate()
.then(() => {
        logger.info('Database connection has been established successfully.');
    })
    .catch(err => {
        logger.error('Unable to connect to the database:', err);
    });

sequelize.sync()
.then(() => {
        logger.info('Database synchronized successfully.');
    })
    .catch(err => {
        logger.error('Error synchronizing the database:', err);
    });    

module.exports = sequelize;
