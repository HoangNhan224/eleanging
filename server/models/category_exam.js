const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CategoryExam = sequelize.define(
  'CategoryExam',
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
    tableName: 'category_exam',
    timestamps: true
  }
)

module.exports = CategoryExam
