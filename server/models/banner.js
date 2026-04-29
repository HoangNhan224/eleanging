const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('course', 'group'),
    allowNull: false
  },
  examId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  topNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'banner',
  timestamps: false
})

module.exports = Banner
