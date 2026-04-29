const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Exam = sequelize.define(
  'Exam',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    categoryExamId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true
    },
    groupId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    durationInMinute: {
      type: DataTypes.INTEGER
    },
    pointToPass: {
      type: DataTypes.INTEGER
    },
    createrId: {
      type: DataTypes.BIGINT
    },
    numberOfAttempt: {
      type: DataTypes.TINYINT
    },
    numberOfQuestion: {
      type: DataTypes.TINYINT
    },
    answerVisible: {
      type: DataTypes.BOOLEAN
    },
    publicDate: {
      type: DataTypes.DATE
    },
    publicStatus: {
      type: DataTypes.TINYINT
    }
  },
  {
    tableName: 'exams',
    timestamps: true
  }
)

module.exports = Exam
