const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const UserAnswerHistory = sequelize.define(
  'UserAnswerHistory',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    attempt: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userAnswer: {
      type: DataTypes.TEXT
    },
    score: {
      type: DataTypes.TINYINT
    },
    isCorrect: {
      type: DataTypes.BOOLEAN
    },
    overAllScore: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'users_answer_history',
    timestamps: true
  }
)

module.exports = UserAnswerHistory
