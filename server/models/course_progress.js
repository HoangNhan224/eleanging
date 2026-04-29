const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CourseProgress = sequelize.define(
  'CourseProgress',
  {
    enrollmentId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    lessionId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    completion_at: {
      type: DataTypes.BOOLEAN
    }
  },
  {
    tableName: 'course_progress',
    timestamps: true
  }
)

module.exports = CourseProgress
