// const { DataTypes } = require('sequelize')
// const sequelize = require('./init')

// const LessionCompleted = sequelize.define(
//   'LessionCompleted',
//   {
//     userId: {
//       type: DataTypes.BIGINT,
//       allowNull: false,
//       primaryKey: true
//     },
//     lessionId: {
//       type: DataTypes.BIGINT,
//       allowNull: false,
//       primaryKey: true
//     },
//     completionDate: {
//       type: DataTypes.DATE,
//       allowNull: false
//     }
//   },
//   {
//     tableName: 'lession_completed',
//     indexes: [
//       {
//         unique: true,
//         fields: ['userId', 'lessionId']
//       }
//     ]
//   }
// )
// module.exports = LessionCompleted
