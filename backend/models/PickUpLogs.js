const { Datatypes } = require('sequelize');
const sequelize = require('../configs/db');
const PickUpLogs = sequelize.define('PickUpLogs', {
    id: {
        type: Datatypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pickup_request_id: {
        type: Datatypes.INTEGER,
        allowNull: false,
        references: {
            model: 'PickUps',
            key: 'id'
        }
    },
    action: {
        type: Datatypes.ENUM('created', 'approved', 'rejected'),
        allowNull: false
    },
    timestamp: {
        type: Datatypes.DATE,
        allowNull: false,
        defaultValue: Datatypes.NOW
    },
    performed_by:{
        type: Datatypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: false
});