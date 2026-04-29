const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    microsoftId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    },
    age: {
      type: DataTypes.INTEGER
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    refreshToken: {
      type: DataTypes.STRING
    },
    expiredToken: {
      type: DataTypes.DATE
    },
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 3
    },
    groupId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Math.floor(Math.random() * 18) + 1
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otp: {
      type: DataTypes.STRING
    },
    otpExpires: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: 'users',
    timestamps: true
  }
)

module.exports = User
