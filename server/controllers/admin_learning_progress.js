const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const sequelize = require('../models/init')
const { infoLogger, errorLogger } = require('../logs/logger')

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error: error.message,
    user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user.id
  })
}

/**
 * Get all users' learning progress (Admin only).
 *
 * @route GET /
 * @param {string} [req.query.page] - Page number (default 1).
 * @param {string} [req.query.size] - Page size (default 25).
 * @param {string} [req.query.search] - Search by user name.
 * @param {string} [req.query.courseId] - Filter by course ID.
 * @returns {Promise<Object>} Paginated list of user learning progress.
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const size = parseInt(req.query.size, 10) || 25
    const offset = (page - 1) * size
    const search = req.query.search ? `%${req.query.search}%` : null
    const courseId = req.query.courseId || null
    const statusFilter = req.query.status || null // 'completed', 'in_progress', 'not_started'
    const groupId = req.query.groupId || null

    const whereClauses = ['u.roleId = 3']
    const replacements = { size, offset }

    if (search) {
      whereClauses.push("(CONCAT_WS(' ', u.firstName, u.lastName) LIKE :search OR u.email LIKE :search)")
      replacements.search = search
    }

    if (groupId) {
      whereClauses.push('u.groupId = :groupId')
      replacements.groupId = groupId
    }

    // Status filter applied as a late-stage clause (needs enrollment context)
    let statusClause = ''
    if (statusFilter === 'completed') {
      statusClause = 'AND e.status = 1'
    } else if (statusFilter === 'in_progress') {
      statusClause = 'AND e.status = 0 AND e.progress > 0'
    } else if (statusFilter === 'not_started') {
      statusClause = 'AND (e.id IS NULL OR e.progress = 0 OR e.progress IS NULL)'
    }

    // When courseId is specified: show ALL users for that specific course
    // When no courseId: show users with their enrollment data (LEFT JOIN)
    if (courseId) {
      replacements.courseId = courseId

      const whereClause = whereClauses.length > 0
        ? `WHERE ${whereClauses.join(' AND ')} AND c.id = :courseId`
        : 'WHERE c.id = :courseId'

      // Count total records
      const totalRecordsQuery = await sequelize.query(`
        SELECT COUNT(*) AS totalRecords
        FROM (
          SELECT u.id
          FROM users u
          CROSS JOIN courses c
          LEFT JOIN enrollments e ON e.userId = u.id AND e.courseId = c.id
          LEFT JOIN \`groups\` g ON u.groupId = g.id
          ${whereClause}
          ${statusClause}
        ) AS sub
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })

      const totalRecords = totalRecordsQuery[0].totalRecords
      const totalPages = Math.ceil(totalRecords / size)

      // Get paginated data - all users × specific course, LEFT JOIN enrollments
      const data = await sequelize.query(`
        SELECT
          e.id AS enrollmentId,
          u.id AS userId,
          CONCAT_WS(' ', u.firstName, u.lastName) AS userName,
          u.email AS userEmail,
          c.id AS courseId,
          c.name AS courseName,
          COALESCE(e.progress, 0) AS progress,
          COALESCE(e.status, 0) AS status,
          e.enrollment_date AS enrollmentDate,
          e.completedDate AS completedDate,
          g.name AS groupName,
          COALESCE((SELECT COUNT(*) FROM course_progress cp WHERE cp.enrollmentId = e.id), 0) AS completedLessons,
          (
            SELECT COUNT(*)
            FROM lessions l
            JOIN category_lession cl ON l.lessionCategoryId = cl.id
            WHERE cl.courseId = c.id
          ) AS totalLessons
        FROM users u
        CROSS JOIN courses c
        LEFT JOIN enrollments e ON e.userId = u.id AND e.courseId = c.id
        LEFT JOIN \`groups\` g ON u.groupId = g.id
        ${whereClause}
        ${statusClause}
        ORDER BY e.progress IS NULL ASC, e.progress DESC, u.id ASC
        LIMIT :size OFFSET :offset
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })

      logInfo(req, { message: 'Admin learning progress accessed' })

      res.json({
        currentPage: page,
        pageSize: size,
        totalPages,
        totalRecords,
        data
      })
    } else {
      // No courseId filter: show enrolled users + users who have no enrollments at all
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

      // Count total records
      const totalRecordsQuery = await sequelize.query(`
        SELECT COUNT(*) AS totalRecords
        FROM (
          SELECT u.id
          FROM users u
          LEFT JOIN enrollments e ON e.userId = u.id
          LEFT JOIN courses c ON e.courseId = c.id
          LEFT JOIN \`groups\` g ON u.groupId = g.id
          ${whereClause ? whereClause + ' ' + statusClause : statusClause ? 'WHERE 1=1 ' + statusClause : ''}
          GROUP BY u.id, COALESCE(c.id, 0)
        ) AS sub
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })

      const totalRecords = totalRecordsQuery[0].totalRecords
      const totalPages = Math.ceil(totalRecords / size)

      // Get paginated data
      const data = await sequelize.query(`
        SELECT
          e.id AS enrollmentId,
          u.id AS userId,
          CONCAT_WS(' ', u.firstName, u.lastName) AS userName,
          u.email AS userEmail,
          c.id AS courseId,
          c.name AS courseName,
          COALESCE(e.progress, 0) AS progress,
          COALESCE(e.status, 0) AS status,
          e.enrollment_date AS enrollmentDate,
          e.completedDate AS completedDate,
          g.name AS groupName,
          COALESCE((SELECT COUNT(*) FROM course_progress cp WHERE cp.enrollmentId = e.id), 0) AS completedLessons,
          COALESCE(
            (
              SELECT COUNT(*)
              FROM lessions l
              JOIN category_lession cl ON l.lessionCategoryId = cl.id
              WHERE cl.courseId = c.id
            ), 0
          ) AS totalLessons
        FROM users u
        LEFT JOIN enrollments e ON e.userId = u.id
        LEFT JOIN courses c ON e.courseId = c.id
        LEFT JOIN \`groups\` g ON u.groupId = g.id
        ${whereClause ? whereClause + ' ' + statusClause : statusClause ? 'WHERE 1=1 ' + statusClause : ''}
        ORDER BY e.progress IS NULL ASC, COALESCE(e.createdAt, u.createdAt) DESC
        LIMIT :size OFFSET :offset
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })

      logInfo(req, { message: 'Admin learning progress accessed' })

      res.json({
        currentPage: page,
        pageSize: size,
        totalPages,
        totalRecords,
        data
      })
    }
  } catch (err) {
    logError(req, err)
    console.error(err.message)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Get summary statistics for all users' learning progress.
 *
 * @route GET /summary
 * @param {string} [req.query.courseId] - Filter by course ID.
 * @returns {Promise<Object>} Summary stats: totalUsers, completedCount, inProgressCount, notStartedCount, avgProgress.
 */
router.get('/summary', isAuthenticated, async (req, res) => {
  try {
    const courseId = req.query.courseId || null
    const replacements = {}

    if (courseId) {
      replacements.courseId = courseId

      // With courseId: count all users vs that specific course
      const stats = await sequelize.query(`
        SELECT
          COUNT(*) AS totalUsers,
          SUM(CASE WHEN e.status = 1 THEN 1 ELSE 0 END) AS completedCount,
          SUM(CASE WHEN e.status != 1 AND e.progress > 0 THEN 1 ELSE 0 END) AS inProgressCount,
          SUM(CASE WHEN e.id IS NULL OR e.progress = 0 OR e.progress IS NULL THEN 1 ELSE 0 END) AS notStartedCount,
          COALESCE(AVG(CASE WHEN e.id IS NOT NULL AND e.progress > 0 THEN e.progress ELSE NULL END), 0) AS avgProgress
        FROM users u
        CROSS JOIN courses c
        LEFT JOIN enrollments e ON e.userId = u.id AND e.courseId = c.id
        WHERE c.id = :courseId AND u.roleId = 3
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })

      const row = stats[0]
      const totalUsers = Number(row.totalUsers) || 0
      const completedCount = Number(row.completedCount) || 0
      const inProgressCount = Number(row.inProgressCount) || 0
      const notStartedCount = Number(row.notStartedCount) || 0
      const totalEnrollments = completedCount + inProgressCount + notStartedCount
      const avgProgress = totalEnrollments > 0 ? Math.round((completedCount * 100) / totalEnrollments) : 0

      res.json({
        totalUsers,
        completedCount,
        inProgressCount,
        notStartedCount,
        avgProgress
      })
    } else {
      // Without courseId: aggregate across all enrollments
      const stats = await sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE roleId = 3) AS totalUsers,
          SUM(CASE WHEN e.status = 1 THEN 1 ELSE 0 END) AS completedCount,
          SUM(CASE WHEN e.status != 1 AND e.progress > 0 THEN 1 ELSE 0 END) AS inProgressCount,
          COALESCE(AVG(e.progress), 0) AS avgProgress
        FROM enrollments e
        JOIN users u ON u.id = e.userId AND u.roleId = 3
      `, {
        type: sequelize.QueryTypes.SELECT
      })

      const row = stats[0]
      const totalUsers = Number(row.totalUsers) || 0
      const completedCount = Number(row.completedCount) || 0
      const inProgressCount = Number(row.inProgressCount) || 0

      // Count users with no enrollments at all
      const noEnrollment = await sequelize.query(`
        SELECT COUNT(*) AS cnt
        FROM users u
        WHERE u.roleId = 3 AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.userId = u.id)
      `, {
        type: sequelize.QueryTypes.SELECT
      })
      const notStartedCount = Number(noEnrollment[0].cnt) || 0
      const totalEnrollments = completedCount + inProgressCount + notStartedCount
      const avgProgress = totalEnrollments > 0 ? Math.round((completedCount * 100) / totalEnrollments) : 0

      res.json({
        totalUsers,
        completedCount,
        inProgressCount,
        notStartedCount,
        avgProgress
      })
    }
  } catch (err) {
    logError(req, err)
    console.error(err.message)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
