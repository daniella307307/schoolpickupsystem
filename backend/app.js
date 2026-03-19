const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./configs/logger');
const sequelize = require('./configs/db');
require('dotenv').config();
const userRoutes = require('./routes/userRoute');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', userRoutes);
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});