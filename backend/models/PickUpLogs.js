const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');
const PickUpLogs = sequelize.define('PickUpLogs', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pickup_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'PickUps',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.ENUM('created', 'approved', 'rejected'),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    performed_by:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: false
});
module.exports = PickUpLogs;