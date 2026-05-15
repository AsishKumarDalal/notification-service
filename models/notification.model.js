const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'),
    defaultValue: 'PENDING'
  },
  channel: {
    type: DataTypes.ENUM('EMAIL', 'SMS', 'PUSH'),
    allowNull: true
  },
  idempotencyKey: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  clickedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Notification;
