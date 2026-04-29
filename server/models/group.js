const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Group = sequelize.define(
  'Group',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'groups',
    timestamps: true
  }
)

module.exports = Group
