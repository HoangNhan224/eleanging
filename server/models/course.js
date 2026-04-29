const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    categoryCourseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    summary: {
      type: DataTypes.TEXT
    },
    assignedBy: {
      type: DataTypes.BIGINT
    },
    durationInMinute: {
      type: DataTypes.INTEGER
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    description: {
      type: DataTypes.TEXT
    },
    locationPath: {
      type: DataTypes.STRING
    },
    prepare: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(15, 2)
    },
    publicStatus: {
      type: DataTypes.INTEGER
    },
    publicDate: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: 'courses',
    timestamps: true
  }
)
module.exports = Course
