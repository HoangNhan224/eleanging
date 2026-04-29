/* eslint-disable no-unused-vars */
const { sequelize } = require('../models')
const express = require('express')
const router = express.Router()
const { Banner, Exam, UserAnswerHistory, User } = require('../models').models

router.post('/', async (req, res) => {
  try {
    const { type, examId, topNumber } = req.body

    if (!type || !examId || !topNumber) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' })
    }

    if (!['course', 'group'].includes(type)) {
      return res.status(400).json({ message: 'Type không hợp lệ' })
    }

    const exam = await Exam.findByPk(examId)
    if (!exam) {
      return res.status(404).json({ message: 'Bài thi không tồn tại' })
    }

    if (type === 'course' && !exam.courseId) {
      return res.status(400).json({ message: 'Bài thi không thuộc khóa học' })
    }

    if (type === 'group' && !exam.groupId) {
      return res.status(400).json({ message: 'Bài thi không thuộc nhóm' })
    }

    await Banner.update(
      { isActive: 0 },
      { where: { isActive: 1 } }
    )

    const banner = await Banner.create({
      type,
      examId,
      topNumber,
      isActive: 1
    })

    return res.status(201).json({
      message: 'Lưu banner thành công',
      banner
    })
  } catch (error) {
    console.error('Create banner error:', error)
    return res.status(500).json({ message: 'Lỗi server' })
  }
})

router.get('/', async (req, res) => {
  try {
    const banner = await Banner.findOne({ where: { isActive: 1 } })
    if (!banner) {
      return res.status(404).json({ message: 'Không có banner active' })
    }
    return res.json({ banner })
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
})

router.get('/top-score', async (req, res) => {
  try {
    const banner = await Banner.findOne({ where: { isActive: 1 } })
    if (!banner) {
      return res.status(404).json({ message: 'Không có banner active' })
    }

    const query = `
      SELECT 
          r.userId,
          usr.email,
          r.score AS topScore,
          r.duration,
          r.attempt AS attemptCount,
          r.enterTime AS firstEnterTime,
          r.totalAttempts,
          COALESCE(c.name, e.name) AS sourceName
      FROM (
          SELECT 
              u.userId,
              u.score,
              TIMESTAMPDIFF(SECOND, u.enterTime, u.exitTime) AS duration,
              u.attempt,
              u.enterTime,
              COUNT(u.attempt) OVER(PARTITION BY u.userId) as totalAttempts,
              ROW_NUMBER() OVER(
                  PARTITION BY u.userId 
                  ORDER BY u.score DESC, TIMESTAMPDIFF(SECOND, u.enterTime, u.exitTime) ASC, u.enterTime ASC
              ) as rank_row
          FROM user_enter_exit_exam_room u
          WHERE u.examId = :examId  AND u.exitTime IS NOT NULL
      ) AS r
      JOIN Users usr ON r.userId = usr.id
      JOIN exams e ON e.id = :examId
      LEFT JOIN courses c ON e.courseId = c.id
      LEFT JOIN \`groups\` g ON e.groupId = g.id
      WHERE r.rank_row = 1
      ORDER BY r.score DESC, r.duration ASC, r.totalAttempts ASC, r.enterTime ASC
      LIMIT :limit;
    `

    const topUsers = await sequelize.query(query, {
      replacements: {
        examId: banner.examId,
        limit: banner.topNumber
      },
      type: sequelize.QueryTypes.SELECT
    })

    return res.json({ banner, topUsers })
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
})

module.exports = router
