const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CategoryCourse = sequelize.define(
  'CategoryCourse',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'category_course',
    timestamps: true
  }
)

module.exports = CategoryCourse
