const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CategoryLession = sequelize.define(
  'CategoryLession',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checkUpDate: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: 'category_lession'
  }
)
module.exports = CategoryLession
