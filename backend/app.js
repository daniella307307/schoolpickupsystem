const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./configs/logger');
require('dotenv').config();
const db =require('./configs/db');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});