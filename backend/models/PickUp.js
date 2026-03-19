const {DataTypes} = require('sequelize');
const sequelize = require('../configs/db');
const PickUp = sequelize.define('PickUp', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Students',
            key: 'id'
        }
    },
    pickup_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    message:{
        type: DataTypes.STRING,
        allowNull: true
    },
    status:{
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true
}); 

module.exports = PickUp;