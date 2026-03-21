const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'parent','staff','student'),
        defaultValue: 'parent'
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
    
}, {
    timestamps: true
});

module.exports = User;