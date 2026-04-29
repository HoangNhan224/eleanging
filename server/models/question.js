const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Question = sequelize.define(
  'Question',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    instruction: {
      type: DataTypes.TEXT
    },
    content: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.STRING
    },
    a: {
      type: DataTypes.TEXT
    },
    b: {
      type: DataTypes.TEXT
    },
    c: {
      type: DataTypes.TEXT
    },
    d: {
      type: DataTypes.TEXT
    },
    e: {
      type: DataTypes.TEXT
    },
    f: {
      type: DataTypes.TEXT
    },
    g: {
      type: DataTypes.TEXT
    },
    h: {
      type: DataTypes.TEXT
    },
    i: {
      type: DataTypes.TEXT
    },
    j: {
      type: DataTypes.TEXT
    },
    k: {
      type: DataTypes.TEXT
    },
    l: {
      type: DataTypes.TEXT
    },
    m: {
      type: DataTypes.TEXT
    },
    n: {
      type: DataTypes.TEXT
    },
    o: {
      type: DataTypes.TEXT
    },
    p: {
      type: DataTypes.TEXT
    },
    answer: {
      type: DataTypes.TEXT
    },
    explanation: {
      type: DataTypes.TEXT
    },
    order: {
      type: DataTypes.INTEGER
    },
    category: {
      type: DataTypes.STRING
    },
    target_id: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'questions',
    timestamps: true
  }
)

module.exports = Question
