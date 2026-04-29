const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const QuestionDiscussion = sequelize.define(
  'QuestionDiscussion',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    like: {
      type: DataTypes.INTEGER
    },
    unlike: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'question_discussion',
    timestamps: true
  }
)

module.exports = QuestionDiscussion
