const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const TempUserAnswer = sequelize.define(
  'TempUserAnswer',
  {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userAnswer: {
      type: DataTypes.TEXT
    },
    page: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'temp_users_answer',
    timestamps: true
  }
)

module.exports = TempUserAnswer
