/* eslint-disable no-unused-vars */
/* eslint-disable no-unneeded-ternary */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const Sequelize = require('sequelize')
const { hasOverAttempt, checkIfCorrect, getScore, getMaxExamScore } = require('../logic/exam')
const { Op } = require('sequelize')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

const validateSession = async (req, res, next) => {
  try {
    const { id: examId } = req.params
    const userId = req.user.id
    console.log('Headers từ client:', req.headers)
    const clientSessionId = req.headers['x-exam-session-id']
    console.log('SessionId từ client:', clientSessionId)
    if (!clientSessionId) {
      return next()
    }

    const roomRecord = await models.UserEnterExitExamRoom.findOne({
      where: { userId, examId, exitTime: null },
      order: [['attempt', 'DESC']]
    })
    console.log('SessionId trong DB:', roomRecord?.sessionId)
    if (roomRecord && roomRecord.sessionId && roomRecord.sessionId !== clientSessionId) {
      return res.status(423).json({ error: 'INVALID_SESSION', message: 'Phiên làm việc đã được mở ở nơi khác.', examId })
    }

    next()
  } catch (error) {
    console.error('Session validation error:', error)
    next()
  }
}

router.get('/check_attempt_allow/:id', isAuthenticated, async (req, res) => {
  try {
    const examId = req.params.id
    const userId = req.user.id
    console.log('>>> examId', examId)
    console.log('>>> userId', userId)
    const exam = await models.Exam.findOne({
      where: { id: examId }
    })
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' })
    }
    const userExamHistory = await models.UserEnterExitExamRoom.findAll({
      where: {
        userId,
        examId
      },
      order: [['attempt', 'DESC']]
    })
    const lastAttempt = userExamHistory.length > 0 ? userExamHistory[0].attempt : 0
    console.log('>>> lastAttempt', lastAttempt)

    let isAllowed = false

    if (lastAttempt < exam.numberOfAttempt) {
      // Not yet reached the limit, allow to take the exam
      isAllowed = true
    } else if (lastAttempt === exam.numberOfAttempt) {
      // Exactly at the allowed attempts, check the last time
      const lastExam = userExamHistory[0]
      if (lastExam) {
        // If there is an exitTime or submitted, not allowed to take the exam anymore
        if (lastExam.exitTime) {
          isAllowed = false
        } else {
          // Check if there is still time left
          const { enterTime } = lastExam
          const { durationInMinute } = exam
          const enterTimeMs = new Date(enterTime).getTime()
          const endTimeMs = enterTimeMs + durationInMinute * 60 * 1000
          if (endTimeMs > Date.now()) {
            isAllowed = true // There is still time left, allow to continue the exam
          } else {
            isAllowed = false // Time is up
          }
        }
      } else {
        isAllowed = false // No last data available
      }
    } else {
      // Exceeded the allowed attempts
      isAllowed = false
    }

    res.json({ isAllowed })
  } catch (error) {
    console.error('Error checking exam attempt:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Retrieves user scores and statistics for a specific exam.
 *
 * @author Hien
 * @route GET /statistic/:id/user-scores
 * @param {string} req.params.id - The ID of the exam for which to retrieve statistics.
 * @param {string} [req.query.start='0'] - The starting index for pagination.
 * @param {string} [req.query.size='25'] - The number of records to return per page.
 * @param {string} [req.query.globalFilter=''] - A global filter string to search across user info and exam name.
 * @returns {Promise<Object>} An object containing an array of user score data and metadata about the total record count.
 * @throws {Error} If there is an error fetching the statistics.
 */
router.get('/statistic/:id/user-scores', isAuthenticated, async (req, res) => {
  try {
    const {
      start = '0',
      size = '25',
      globalFilter = ''
    } = req.query

    const offset = Math.max(parseInt(start, 10) || 0, 0)
    const limit = Math.max(parseInt(size, 10) || 25, 1)

    const requestedExamId = req.params.id

    // Lấy thông tin các lần vào phòng thi của user cho exam này
    const userExamRooms = await models.UserEnterExitExamRoom.findAll({
      where: { examId: requestedExamId },
      include: [{
        model: models.User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      raw: true,
      nest: true
    })

    const examInfo = await models.Exam.findOne({
      attributes: ['name', 'pointToPass', 'durationInMinute', 'numberOfAttempt'],
      where: { id: requestedExamId }
    })

    const examDurationMs = examInfo ? examInfo.dataValues.durationInMinute * 60 * 1000 : 0

    const aggregated = userExamRooms.reduce((acc, item) => {
      const userId = item.User.id
      if (!acc[userId]) {
        acc[userId] = {
          userInfo: {
            id: item.User.id,
            email: item.User.email || '',
            fullName: `${item.User.firstName || ''} ${item.User.lastName || ''}`.trim()
          },
          attempts: []
        }
      }
      let expireTime = null
      if (item.enterTime && examDurationMs > 0) {
        expireTime = new Date(new Date(item.enterTime).getTime() + examDurationMs)
      }

      acc[userId].attempts.push({
        attempt: item.attempt,
        score: item.score,
        exitTime: item.exitTime,
        enterTime: item.enterTime,
        expireTime
      })
      return acc
    }, {})

    let finalResult = Object.values(aggregated).map(group => ({
      ...group,
      name: examInfo ? examInfo.dataValues.name : null,
      numberOfAttempt: examInfo ? examInfo.dataValues.numberOfAttempt : null,
      pointToPass: examInfo ? examInfo.dataValues.pointToPass : null
    }))

    // Lọc theo globalFilter
    if (globalFilter) {
      finalResult = finalResult.filter((item) => {
        const { fullName, email } = item.userInfo
        const filterText = globalFilter.toLowerCase()
        return (
          (fullName && fullName.toLowerCase().includes(filterText)) ||
          (email && email.toLowerCase().includes(filterText))
        )
      })
    }

    const paginatedResult = finalResult.slice(offset, offset + limit)

    res.json({ data: paginatedResult, meta: { totalRowCount: finalResult.length } })
  } catch (error) {
    console.error('Error fetching user scores:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/submit_unsubmitted_exam_admin/:id', isAuthenticated, async (req, res) => {
  try {
    const examId = req.params.id
    const allExamQuestions = await getAllQuestionInExam(examId)
    const totalQuestionsCount = allExamQuestions.length
    const scorePerQuestion = 100 / totalQuestionsCount

    const examInfo = await models.Exam.findOne({ where: { id: examId } })

    const rooms = await models.UserEnterExitExamRoom.findAll({
      where: { examId, exitTime: null }
    })

    let totalUpdated = 0
    let skipped = 0

    for (const room of rooms) {
      const { userId, attempt, enterTime } = room

      // Check if there is still time left
      const startTime = new Date(enterTime).getTime()
      const duration = examInfo.durationInMinute * 60 * 1000
      const endTime = startTime + duration
      const now = Date.now()
      if (now < endTime) {
        skipped++
        continue
      }

      const tempAnswers = await models.TempUserAnswer.findAll({
        where: { userId, examId }
      })
      let userAnswers = []
      let overallScore = 0

      if (tempAnswers.length > 0) {
        userAnswers = tempAnswers.map(item => {
          const question = allExamQuestions.find(q => q.id === item.questionId)
          const correctAnswer = question?.answer || ''
          const isCorrect = checkIfCorrect(question?.type, item.userAnswer, correctAnswer)
          return {
            userId,
            examId,
            questionId: item.questionId,
            userAnswer: item.userAnswer,
            isCorrect,
            score: isCorrect ? scorePerQuestion : 0,
            attempt
          }
        })

        // Calculate the number of correct answers
        const numCorrect = userAnswers.filter(a => a.isCorrect).length
        overallScore = Math.round(numCorrect * scorePerQuestion)

        await models.UserAnswerHistory.bulkCreate(userAnswers)
      } else {
        overallScore = 0
      }

      await models.TempUserAnswer.destroy({ where: { userId, examId } })

      await models.UserEnterExitExamRoom.update(
        {
          exitTime: startTime + duration,
          score: overallScore
        },
        {
          where: { userId, examId, exitTime: null, attempt }
        }
      )
      totalUpdated++
    }

    return res.status(200).json({ success: true, totalUpdated, skipped })
  } catch (error) {
    console.error('Error admin submitting unsubmitted exams:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/unsubmitted_exam/:id', isAuthenticated, async (req, res) => {
  console.log('>>> req.params.id', req.params.id)
  try {
    const response = await models.UserEnterExitExamRoom.findAll({
      where: {
        userId: req.user.id,
        examId: req.params.id,
        exitTime: null
      }
    })
    console.log('>>> response', response)

    // If user has an unsubmitted exam session
    if (response.length > 0) {
      // Get exam information to check duration
      const examInfo = await models.Exam.findOne({
        where: { id: req.params.id }
      })

      // Calculate end time based on enterTime and duration
      const enterTime = new Date(response[0].enterTime).getTime()
      const duration = examInfo.durationInMinute * 60 * 1000 // convert minutes to milliseconds
      const endTime = enterTime + duration
      const currentTime = Date.now()

      // Determine status based on time comparison
      const status = currentTime > endTime ? 'expired' : 'active'

      return res.status(200).json({
        examId: req.params.id,
        attempt: response[0].attempt,
        unsubmitted: true,
        status,
        endTime,
        currentTime,
        timeRemaining: Math.floor(Math.max(0, endTime - currentTime) / 1000)
      })
    } else {
      return res.status(200).json({
        examId: req.params.id,
        attempt: null,
        unsubmitted: false,
        status: 'none'
      })
    }
  } catch (error) {
    console.error('Error checking exam not submitted yet:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})
router.post('/submit_unsubmitted_exam/:id', isAuthenticated, async (req, res) => {
  try {
    const allExamQuestions = await getAllQuestionInExam(req.params.id)
    const totalQuestionsCount = allExamQuestions.length
    const response = await models.UserEnterExitExamRoom.findAll({
      where: {
        userId: req.user.id,
        examId: req.params.id,
        exitTime: null
      }
    })

    if (response.length === 0) {
      return res.status(200).json(false)
    }

    const examInfo = await models.Exam.findOne({
      where: { id: req.params.id }
    })

    const tempAnswers = await models.TempUserAnswer.findAll({
      where: {
        userId: req.user.id,
        examId: req.params.id
      }
    })

    let userAnswers = []
    let overallScore = 0

    if (tempAnswers.length > 0) {
      userAnswers = tempAnswers.map(item => {
        const question = allExamQuestions.find(q => q.id === item.questionId)
        const correctAnswer = question?.answer || ''
        const isCorrect = checkIfCorrect(question?.type, item.userAnswer, correctAnswer)
        return {
          userId: req.user.id,
          examId: req.params.id,
          questionId: item.questionId,
          userAnswer: item.userAnswer,
          isCorrect,
          score: getScore(item.questionId, item.userAnswer, examInfo.answerVisible, correctAnswer),
          attempt: response[0].attempt
        }
      })

      // Calculate the number of correct answers
      const numCorrect = userAnswers.filter(a => a.isCorrect).length
      overallScore = Math.round((numCorrect / totalQuestionsCount) * 100)

      // Save to answer history
      await models.UserAnswerHistory.bulkCreate(userAnswers)
    } else {
      // No questions answered, score is 0
      overallScore = 0
    }

    // Delete all temp answers
    await models.TempUserAnswer.destroy({
      where: {
        userId: req.user.id,
        examId: req.params.id
      }
    })

    // Update exitTime and score in the exam room
    await models.UserEnterExitExamRoom.update(
      {
        exitTime: new Date(response[0].enterTime).getTime() + examInfo.durationInMinute * 60 * 1000,
        score: overallScore
      },
      {
        where: {
          userId: req.user.id,
          examId: req.params.id,
          exitTime: null,
          attempt: response[0].attempt
        }
      }
    )

    return res.status(200).json(true)
  } catch (error) {
    console.error('Error submitting unsubmitted exam:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * Retrieves a paginated, filtered, and sorted list of exams.
 *
 * @author Hien
 * @route GET /list
 * @param {number|string} req.query.start - The starting index for pagination.
 * @param {number|string} req.query.size - The number of records per page.
 * @param {string} [req.query.filters='[]'] - A JSON string array of additional filter conditions.
 * @param {string} [req.query.globalFilter=''] - A global filter string applied to exam and course/group names.
 * @param {string} [req.query.sorting='[]'] - A JSON string array of sorting options.
 * @param {string} [req.query.filterOption='COURSE'] - The filter option to determine join with Course or Group.
 * @returns {Promise<Object>} A JSON object containing the data and metadata.
 * @throws {Error} If an error occurs during processing.
 */
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const {
      start = 0,
      size = 25,
      filters = '[]',
      globalFilter = '',
      sorting = '[]',
      filterOption = 'COURSE'
    } = req.query

    const offset = Math.max(parseInt(start, 10) || 0, 0)
    const limit = Math.max(parseInt(size, 10) || 10, 1)

    const parsedFilters = JSON.parse(filters)
    const parsedSorting = JSON.parse(sorting)

    const allColumns = ['name']

    const where = {
      [filterOption === 'COURSE' ? 'courseId' : 'groupId']: {
        [Op.not]: null
      }
    }

    // TODO: If a global filter is provided, then apply it across Exam fields and associated Course/Group names.
    if (globalFilter) {
      where[Op.or] = [
        ...allColumns.map(column => ({
          [column]: { [Op.like]: `%${globalFilter}%` }
        })),
        filterOption === 'COURSE'
          ? { '$courses.name$': { [Op.like]: `%${globalFilter}%` } }
          : { '$groups.name$': { [Op.like]: `%${globalFilter}%` } }
      ]
    }

    // TODO: Process additional filter conditions provided via the parsedFilters array
    if (parsedFilters.length > 0) {
      parsedFilters.forEach(filter => {
        if (filter.id === 'courseName' && filterOption === 'COURSE') {
          where['$courses.name$'] = { [Op.like]: `%${filter.value}%` }
        } else if (filter.id === 'groupName' && filterOption === 'GROUP') {
          where['$groups.name$'] = { [Op.like]: `%${filter.value}%` }
        } else if (allColumns.includes(filter.id)) {
          where[filter.id] = { [Op.like]: `%${filter.value}%` }
        }
      })
    }

    // TODO: Build the sorting clause for the SQL query
    let order = []
    if (parsedSorting.length > 0) {
      order = parsedSorting.map(sort => {
        if (sort.id === 'courseName' && filterOption === 'COURSE') {
          return [{ model: models.Course, as: 'courses' }, 'name', sort.desc ? 'DESC' : 'ASC']
        } else if (sort.id === 'groupName' && filterOption === 'GROUP') {
          return [{ model: models.Group, as: 'groups' }, 'name', sort.desc ? 'DESC' : 'ASC']
        } else if (allColumns.includes(sort.id)) {
          return [sort.id, sort.desc ? 'DESC' : 'ASC']
        }
        return null
      }).filter(item => item !== null)
    }
    // TODO: If no sorting is provided, default to sorting by exam ID in descending order.
    if (order.length === 0) {
      order = [['id', 'DESC']]
    }

    // TODO: Setup the include clause to join with either Course or Group model based on filterOption.
    const include = []
    if (filterOption === 'COURSE') {
      include.push({
        model: models.Course,
        as: 'courses',
        attributes: ['name']
      })
    } else {
      include.push({
        model: models.Group,
        as: 'groups',
        attributes: ['name']
      })
    }

    // TODO: Query the Exam table with pagination, filters, sorting and joins
    const { rows: data, count: totalRowCount } = await models.Exam.findAndCountAll({
      where,
      offset,
      limit,
      order,
      include,
      distinct: true
    })

    // TODO: Transform the returned data to include a top-level courseName or groupName property
    const transformedData = await Promise.all(data.map(async exam => {
      const examObj = exam.toJSON()
      const creator = await models.User.findOne({
        attributes: ['username'],
        where: { id: examObj.createrId }
      })

      if (filterOption === 'COURSE') {
        return {
          ...examObj,
          courseName: examObj.courses?.name,
          creatorName: creator ? creator.username || '' : ''
        }
      } else {
        return {
          ...examObj,
          groupName: examObj.groups?.name,
          creatorName: creator ? creator.username || '' : ''
        }
      }
    }))

    res.json({ data: transformedData, meta: { totalRowCount } })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
    console.error('Error fetching exam list:', error)
  }
})
router.get('/getAllQuestionInExam/:examId', isAuthenticated, async (req, res) => {
  try {
    const { examId } = req.params
    console.log(typeof examId)
    const listQuestions = await getAllQuestionInExam(examId)
    res.json(listQuestions)
  } catch (error) {
    res.json(error)
  }
})
router.get('/getCourseExam', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id
    const { courseId, name, fromDate, toDate } = req.query
    // Lấy danh sách bài thi mà user đã tham gia và có exitTime
    const userExams = await models.UserEnterExitExamRoom.findAll({
      attributes: ['examId', 'attempt', 'exitTime', 'score'],
      where: {
        userId,
        exitTime: { [Op.ne]: null }
      }
    })

    if (!userExams.length) return res.json([])

    const examIds = [...new Set(userExams.map(ue => ue.examId))]

    // Lọc theo courseId, nếu không có thì bỏ courseId null
    const courseFilter = courseId && courseId !== 'all'
      ? { courseId }
      : { courseId: { [Op.ne]: null } }

    // Lọc theo name (tìm kiếm gần đúng)
    const nameFilter = name
      ? { name: { [Op.like]: `%${name}%` } }
      : {}

    // Lọc theo khoảng thời gian exitTime
    const dateFilter = {}
    if (fromDate) dateFilter[Op.gte] = new Date(fromDate)
    if (toDate) dateFilter[Op.lte] = new Date(toDate)

    // Get exam information
    const exams = await models.Exam.findAll({
      where: {
        id: examIds,
        ...courseFilter,
        ...nameFilter
      },
      attributes: ['id', 'name', 'courseId', 'pointToPass']
    })

    const result = userExams
      .map(ue => {
        const examInfo = exams.find(exam => exam.id === ue.examId)
        if (!examInfo) return null

        return {
          id: examInfo.id,
          name: examInfo.name,
          courseId: examInfo.courseId,
          attempt: ue.attempt,
          exitTime: ue.exitTime,
          score: ue.score,
          pointToPass: examInfo.pointToPass
        }
      })
      .filter(exam => {
        // Lọc theo khoảng thời gian (nếu có)
        if (!exam || !exam.exitTime) return false
        const exitDate = new Date(exam.exitTime)
        return (!fromDate || exitDate >= new Date(fromDate)) &&
               (!toDate || exitDate <= new Date(toDate))
      })
      .sort((a, b) => a.name.localeCompare(b.name) || a.attempt - b.attempt)

    res.json(result)
  } catch (error) {
    console.error('>>> error', error)
    res.status(500).json({ error: 'Lỗi server' })
  }
})
router.get('/getGroupExam', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id
    const { groupId, name, fromDate, toDate } = req.query

    // Lấy danh sách bài thi mà user đã tham gia và có exitTime
    const userExams = await models.UserEnterExitExamRoom.findAll({
      attributes: ['examId', 'attempt', 'exitTime', 'score'],
      where: {
        userId,
        exitTime: { [Op.ne]: null }
      }
    })

    if (!userExams.length) return res.json([])

    const examIds = [...new Set(userExams.map(ue => ue.examId))]

    // Lọc theo groupId, nếu không có thì bỏ groupId null
    const groupFilter = groupId && groupId !== 'all'
      ? { groupId }
      : { groupId: { [Op.ne]: null } }

    // Lọc theo name (tìm kiếm gần đúng)
    const nameFilter = name
      ? { name: { [Op.like]: `%${name}%` } }
      : {}

    // Lọc theo khoảng thời gian exitTime
    const dateFilter = {}
    if (fromDate) dateFilter[Op.gte] = new Date(fromDate)
    if (toDate) dateFilter[Op.lte] = new Date(toDate)

    const exams = await models.Exam.findAll({
      where: {
        id: examIds,
        ...groupFilter,
        ...nameFilter
      },
      attributes: ['id', 'name', 'groupId', 'pointToPass']
    })

    const result = userExams
      .map(ue => {
        const examInfo = exams.find(exam => exam.id === ue.examId)
        if (!examInfo) return null

        return {
          id: examInfo.id,
          name: examInfo.name,
          groupId: examInfo.groupId,
          attempt: ue.attempt,
          exitTime: ue.exitTime,
          score: ue.score,
          pointToPass: examInfo.pointToPass
        }
      })
      .filter(exam => {
        // Lọc theo khoảng thời gian (nếu có)
        if (!exam || !exam.exitTime) return false
        const exitDate = new Date(exam.exitTime)
        return (!fromDate || exitDate >= new Date(fromDate)) &&
               (!toDate || exitDate <= new Date(toDate))
      })
      .sort((a, b) => a.name.localeCompare(b.name) || a.attempt - b.attempt)

    res.json(result)
  } catch (error) {
    console.error('>>> error', error)
    res.status(500).json({ error: 'Lỗi server' })
  }
})
router.get('/getCourseExamList', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.query

    const nameFilter = name
      ? { name: { [Op.like]: `%${name}%` } }
      : {}

    const exams = await models.Exam.findAll({
      where: {
        courseId: { [Op.ne]: null },
        ...nameFilter
      },
      attributes: ['id', 'name', 'courseId', 'pointToPass'],
      order: [['createdAt', 'DESC']]
    })

    res.json(exams)
  } catch (error) {
    console.error('>>> error', error)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.get('/getGroupExamList', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.query

    const nameFilter = name
      ? { name: { [Op.like]: `%${name}%` } }
      : {}

    const exams = await models.Exam.findAll({
      where: {
        groupId: { [Op.ne]: null },
        ...nameFilter
      },
      attributes: ['id', 'name', 'groupId', 'pointToPass'],
      order: [['createdAt', 'DESC']]
    })

    res.json(exams)
  } catch (error) {
    console.error('>>> error', error)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.get('/getCourseAndGroupExam', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id
    const { name, fromDate, toDate } = req.query

    // Chuẩn hóa mốc thời gian trong ngày (local time)
    const startOfDay = fromDate ? new Date(fromDate) : null
    if (startOfDay) startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = toDate ? new Date(toDate) : null
    if (endOfDay) endOfDay.setHours(23, 59, 59, 999)

    // Lấy danh sách bài thi user đã làm, lọc theo khoảng ngày ngay tại DB
    const userExams = await models.UserEnterExitExamRoom.findAll({
      attributes: ['examId', 'attempt', 'exitTime', 'score'],
      where: {
        userId,
        exitTime: {
          [Op.ne]: null,
          ...(startOfDay ? { [Op.gte]: startOfDay } : {}),
          ...(endOfDay ? { [Op.lte]: endOfDay } : {})
        }
      }
    })

    if (!userExams.length) return res.json([])

    const examIds = [...new Set(userExams.map(ue => ue.examId))]

    const nameFilter = name ? { name: { [Op.like]: `%${name}%` } } : {}

    const exams = await models.Exam.findAll({
      where: {
        id: examIds,
        [Op.or]: [
          { courseId: { [Op.ne]: null } },
          { groupId: { [Op.ne]: null } }
        ],
        ...nameFilter
      },
      attributes: ['id', 'name', 'courseId', 'groupId', 'pointToPass']
    })

    const result = userExams
      .map(ue => {
        const examInfo = exams.find(ex => ex.id === ue.examId)
        if (!examInfo) return null
        return {
          id: examInfo.id,
          name: examInfo.name,
          courseId: examInfo.courseId,
          groupId: examInfo.groupId,
          attempt: ue.attempt,
          exitTime: ue.exitTime,
          score: ue.score,
          pointToPass: examInfo.pointToPass
        }
      })
      .filter(exam => {
        if (!exam || !exam.exitTime) return false
        const exitDate = new Date(exam.exitTime)
        if (startOfDay && exitDate < startOfDay) return false
        if (endOfDay && exitDate > endOfDay) return false
        return true
      })
      .sort((a, b) => {
        const dateA = new Date(a.exitTime)
        const dateB = new Date(b.exitTime)
        return dateB.getTime() - dateA.getTime()
      })

    res.json(result)
  } catch (error) {
    console.error('>>> error', error)
    res.status(500).json({ error: 'Lỗi server' })
  }
})
router.get('/getExamByCourseId/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const loginedUserId = req.user.id

    // Lấy exam theo courseId
    const exam = await models.Exam.findOne({
      where: { courseId }
    })
    if (!exam) return res.status(404).json({ error: 'Exam not found' })

    // Lấy thông tin người tạo
    const creator = await models.User.findOne({
      attributes: ['avatar', 'firstName', 'lastName', 'username'],
      where: { id: exam.createrId }
    })

    // Lấy tất cả lịch sử làm bài của user này với exam này
    const userExamHistories = await models.UserEnterExitExamRoom.findAll({
      where: {
        userId: loginedUserId,
        examId: exam.id
      }
    })

    // isPassed: chỉ cần 1 lần score >= pointToPass là true
    const isPassed = userExamHistories.some(
      h => typeof h.score === 'number' && typeof exam.pointToPass === 'number' && h.score >= exam.pointToPass
    )

    // Tìm lần làm bài gần nhất (nếu cần)
    const latestHistory = userExamHistories.length > 0
      ? userExamHistories.reduce((prev, curr) => prev.createdAt > curr.createdAt ? prev : curr)
      : null

    const score = latestHistory ? latestHistory.score : null
    const isUnfinished = latestHistory ? latestHistory.exitTime === null : false

    // Lấy lịch sử trả lời và lịch sử thoát phòng
    const [userAnswerHistory, userExitHistory, tempUserAnswer] = await Promise.all([
      getUserAnswerByUserId(loginedUserId),
      models.UserEnterExitExamRoom.findAll({
        where: {
          userId: loginedUserId,
          examId: exam.id,
          exitTime: { [Sequelize.Op.ne]: null }
        }
      }),
      getTempUserAnswer(loginedUserId, exam.id)
    ])

    exam.dataValues.doThisExamBefore = userExamHistories.length > 0
    exam.dataValues.isPassed = isPassed
    exam.dataValues.score = score
    exam.dataValues.creatorAVT = creator ? creator.avatar : null
    exam.dataValues.creatorName = creator ? creator.username || '' : ''
    exam.dataValues.attempted = userExamHistories.length
    exam.dataValues.isUnfinished =
      (tempUserAnswer && tempUserAnswer.length > 0) ||
      isUnfinished

    res.json(exam)
  } catch (error) {
    console.error('>>> getExamByCourseId error:', error)
    res.status(500).json({ error: 'Lỗi server' })
  }
})
router.get('/getExamByGroupId/:groupId', isAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.params
    const loginedUserId = req.user.id

    // Lấy page và limit từ query, nếu không có thì mặc định
    let { page, limit } = req.query
    page = parseInt(page) || 1
    limit = parseInt(limit) || 8
    const offset = (page - 1) * limit

    // Lấy tổng số bài kiểm tra
    const totalExams = await models.Exam.count({
      where: {
        groupId,
        publicStatus: 1
      }
    })

    // Lấy danh sách bài kiểm tra với phân trang
    const exams = await models.Exam.findAll({
      where: {
        groupId,
        publicStatus: 1
      },
      limit,
      offset
    })

    const updatedExams = await Promise.all(
      exams.map(async (exam) => {
        const creator = await models.User.findOne({
          where: { id: exam.createrId }
        })

        const doThisExamBefore = await models.UserEnterExitExamRoom.findOne({
          where: {
            userId: loginedUserId,
            examId: exam.id
          }
        })

        const userAnswerHistory = await getUserAnswerByUserId(loginedUserId)
        const userExitHistory = await models.UserEnterExitExamRoom.findAll({
          where: {
            userId: loginedUserId,
            examId: exam.id,
            exitTime: { [Op.ne]: null }
          }
        })

        const tempUserAnswer = await getTempUserAnswer(loginedUserId, exam.id)

        return {
          ...exam.dataValues,
          doThisExamBefore: !!doThisExamBefore,
          creatorAVT: creator ? creator.avatar : null,
          creatorName: creator ? creator.username || '' : '',
          attempted: userAnswerHistory.length > 0 ? userExitHistory.length : 0,
          isUnfinished:
            (tempUserAnswer && tempUserAnswer.length > 0) ||
            (doThisExamBefore && doThisExamBefore.exitTime === null)
        }
      })
    )

    res.json({
      total: totalExams, // Tổng số bài kiểm tra
      page,
      limit,
      totalPages: Math.ceil(totalExams / limit), // Tổng số trang
      data: updatedExams // Danh sách bài kiểm tra
    })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống', details: error })
  }
})

// hàm mới - lấy thông tin kỳ thi theo id
router.get('/getDetailExamsOne/:examId', isAuthenticated, async (req, res) => {
  try {
    const { examId } = req.params // Lấy examId từ URL
    console.log('>>> examId', examId)
    // attempted:
    // userAnwserHistory?.find((e) => exam.id === e.examId)?.attempt ?? null,
    // Lấy thông tin của kỳ thi dựa trên examId
    const exam = await models.Exam.findOne({
      where: { studyItemId: examId }, // Điều kiện: chỉ lấy kỳ thi có id tương ứng
      include: [{
        model: models.StudyItem,
        attributes: ['id', 'name', 'description'] // Chỉ lấy các thông tin cần thiết từ StudyItem
      }]
    })

    // Kiểm tra xem kỳ thi có tồn tại không
    if (!exam) {
      return res.status(404).json({ message: 'Kỳ thi không tồn tại' })
    }
    // Lấy lịch sử trả lời của người dùng
    const userAnwserHistory = await getUserAnswerByUserId(req.user.id)
    console.log('>>> userAnwserHistory', userAnwserHistory)
    const userExitHistory = await models.UserEnterExitExamRoom.findAll({
      where: {
        userId: req.user.id,
        examId: exam.id
      }
    })
    // Xử lý dữ liệu và kết hợp thông tin giữa kỳ thi và lịch sử người dùng
    const dataFromDatabase = {
      id: exam.StudyItem.id,
      name: exam.StudyItem.name, // Lấy tên từ bảng StudyItem
      description: exam.StudyItem.description, // Lấy mô tả từ bảng StudyItem
      attempted:
        userExitHistory.length > 0 ? userExitHistory.length : 0, // Số lần tham gia kỳ thi
      numberOfAttempt: exam.numberOfAttempt, // Số lần thử tối đa
      durationInMinute: exam.durationInMinute, // Thời gian làm bài
      score:
        userAnwserHistory?.find((e) => exam.studyItemId === e.examId)?.overAllScore ?? null // Điểm tổng của người dùng
    }

    // Trả về dữ liệu JSON
    res.json({
      data: dataFromDatabase // Trả về dữ liệu của kỳ thi
    })
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra', error }) // Trả về lỗi nếu có
  }
})
/**
 * Retrieves details for a specific exam.
 *
 * @author Hien
 * @route GET /getExam/:id
 * @param {string} req.params.id - The exam ID to fetch.
 * @returns {Promise<Object>} A JSON object containing the exam details if found.
 * @throws {Error} If there is an error during retrieval or if the exam is not found.
 */
router.get('/getExam/:id', isAuthenticated, async (req, res) => {
  try {
    const exam = await models.Exam.findOne({
      where: { id: req.params.id }
    })

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.json(exam)
  } catch (error) {
    console.error('Error fetching exam details:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Updates details of a specific exam.
 *
 * @author Hien
 * @route PUT /:id
 * @param {string} req.params.id - The exam ID to update.
 * @param {Object} req.body.data - The exam details to update, including:
 *   {number} categoryExamId - The category exam ID.
 *   {number} courseId - The course ID.
 *   {number} groupId - The group ID.
 *   {string} name - The exam name.
 *   {string} image - The exam image filename.
 *   {string} description - The exam description.
 *   {number} durationInMinute - The exam duration in minutes.
 *   {number} numberOfQuestion - The number of questions in the exam.
 *   {number} pointToPass - The minimum score required to pass.
 *   {number} numberOfAttempt - The maximum allowed attempts.
 *   {Date} publicDate - The publication date of the exam.
 *   {boolean} publicStatus - The publication status.
 * @returns {Promise<Object>} A JSON object with the updated exam information.
 * @throws {Error} If the exam is not found or an error occurs during the update.
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const examId = req.params.id
    const {
      categoryExamId,
      courseId,
      groupId,
      name,
      image,
      description,
      durationInMinute,
      numberOfQuestion,
      pointToPass,
      numberOfAttempt,
      publicDate,
      publicStatus,
      answerVisible,
      createrId
    } = req.body.data
    const exam = await models.Exam.findByPk(examId)
    if (!exam) {
      return res.status(404).json({ error: 'Exam không tồn tại' })
    }

    await exam.update({
      categoryExamId,
      courseId,
      groupId,
      name,
      image,
      description,
      durationInMinute,
      numberOfQuestion,
      pointToPass,
      numberOfAttempt,
      publicDate,
      publicStatus,
      answerVisible,
      createrId
    })
    return res.status(200).json({ data: exam })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

/**
 * Creates a new exam.
 *
 * @author Hien
 * @route POST /
 * @param {Object} req.body.data - The exam details including:
 *   {number} categoryExamId - The category exam ID.
 *   {number} courseId - The course ID (optional).
 *   {number} groupId - The group ID (optional).
 *   {string} name - The exam name.
 *   {string} image - The exam image filename (optional).
 *   {string} description - The exam description (optional).
 * @returns {Promise<Object>} A JSON object containing the created exam details.
 * @throws {Error} If required fields are missing or an error occurs during creation.
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const {
      categoryExamId,
      courseId,
      groupId,
      name,
      image,
      description,
      createrId
    } = req.body.data

    // TODO: Validate required fields (categoryExamId and name are required)
    if (!categoryExamId || !name) {
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc' })
    }

    // TODO: Create a new exam record in the database using the provided exam details
    const newExam = await models.Exam.create({
      categoryExamId,
      courseId,
      groupId,
      name,
      image,
      description,
      createrId
    })

    res.json(newExam)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Deletes exams and their associated exam questions.
 *
 * @author Hien
 * @route DELETE /
 * @param {Object} req.body - The request body containing an array of exam IDs to delete.
 *   {Array<number>} ExamIds - Array of exam IDs.
 * @returns {Promise<Object>} A success message if deletion is successful.
 * @throws {Error} If input is invalid, the exam cannot be deleted due to foreign key constraints, or a server error occurs.
 */
router.delete('/', isAuthenticated, async (req, res) => {
  try {
    const { ExamIds } = req.body

    // TODO: Validate input: Ensure ExamIds is a non-empty array.
    if (!Array.isArray(ExamIds) || ExamIds.length === 0) {
      return res.status(400).json({ error: 'Invalid input' })
    }

    // TODO: Delete user answer history for the exams
    await models.UserAnswerHistory.destroy({
      where: {
        examId: ExamIds
      }
    })

    // TODO: Delete temporary user answers for the exams
    await models.TempUserAnswer.destroy({
      where: {
        examId: ExamIds
      }
    })

    // TODO: Delete user enter/exit exam room records for the exams
    await models.UserEnterExitExamRoom.destroy({
      where: {
        examId: ExamIds
      }
    })

    // TODO: Delete associated exam questions using the provided exam IDs.
    await models.ExamQuestion.destroy({
      where: {
        examId: ExamIds
      }
    })

    // TODO: Delete the exams with the specified IDs.
    await models.Exam.destroy({
      where: {
        id: ExamIds
      }
    })

    res.status(200).json({ message: 'Deleted successfully' })
  } catch (error) {
    // TODO: Handle foreign key constraint errors.
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete question because it is referenced in other records.' })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Set up the storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/exams/')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

/**
 * Uploads an image for an exam.
 *
 * @author Hien
 * @route POST /upload/image
 * @returns {Promise<Object>} A JSON object containing the uploaded image filename.
 * @throws {Error} If no file is uploaded or an error occurs during upload.
 */
router.post('/upload/image', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    res.json({ image: req.file.filename })
  } catch (error) {
    res.status(500).json({ message: 'Không thể tải ảnh lên' })
  }
})

/**
 * Ensures the directory for lesson uploads exists, creating it if necessary.
 *
 * @author Hien
 * @file user.js
 */

// Define the directory path for lesson uploads
const dir = path.resolve(__dirname, '../uploads/exams')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
  console.log('Directory created:', dir)
} else {
  console.log('Directory already exists:', dir)
}

router.get('/:id/getShortHistory', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id
    const userExamHistory = await models.UserAnswerHistory.findAll({
      attributes: ['examId', 'attempt', 'overAllScore', [Sequelize.fn('max', Sequelize.col('updatedAt')), 'updatedAt'], [Sequelize.fn('COUNT', 'attempt'), 'numberOfQuestions']],
      where: {
        examId: requestedExamId,
        userId: loginedUserId
      },
      group: ['attempt', 'overAllScore']
    })
    const examInfo = await models.Exam.findOne({
      attributes: ['name'],
      where: {
        id: requestedExamId
      }
    })
    const resInfo = userExamHistory.map((item, index) => {
      return {
        ...item.dataValues,
        name: examInfo.dataValues.name
      }
    })
    res.json(resInfo)
  } catch (error) {
    res.json(error)
  }
})

router.post('/:id/saveTemporaryAnswer', isAuthenticated, validateSession, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id

    if (!req.body.data) {
      return res.status(400).json({ success: false, message: 'No data provided' })
    }

    const data = []
    const requestData = req.body.data

    const isFlagged = requestData.isFlagged
    const specificQuestionId = requestData.questionId
    const page = requestData.page
    console.log('>>> requestData', requestData)

    // Xử lý riêng cho câu hỏi được đánh dấu (flag)
    if (isFlagged !== undefined && specificQuestionId) {
      const currentAnswer = await models.TempUserAnswer.findOne({
        where: {
          userId: loginedUserId,
          examId: requestedExamId,
          questionId: specificQuestionId
        }
      })

      const flagItem = {
        userId: loginedUserId,
        examId: requestedExamId,
        questionId: specificQuestionId,
        isFlagged,
        page,
        userAnswer: currentAnswer?.userAnswer || requestData[specificQuestionId] || ''
      }

      await models.TempUserAnswer.upsert(flagItem)

      return res.json({ success: true, message: 'Flag status updated successfully' })
    }

    // Xử lý các câu trả lời bình thường
    for (const [key, value] of Object.entries(requestData)) {
      if (['isFlagged', 'questionId', 'page'].includes(key)) continue

      const currentRecord = await models.TempUserAnswer.findOne({
        where: {
          userId: loginedUserId,
          examId: requestedExamId,
          questionId: key
        }
      })

      const item = {
        userId: loginedUserId,
        examId: requestedExamId,
        questionId: key,
        userAnswer: value,
        page: page || currentRecord?.page || null,
        isFlagged: currentRecord?.isFlagged ?? false // <== chính xác logic bạn cần
      }

      data.push(item)
    }

    if (data.length > 0) {
      await Promise.all(data.map(item => models.TempUserAnswer.upsert(item)))
      return res.json({ success: true, message: 'Answers saved successfully' })
    } else {
      return res.status(400).json({ success: false, message: 'No valid data provided' })
    }
  } catch (error) {
    console.error('Error saving temporary data:', error)
    res.status(500).json({ success: false, message: 'Server error', error })
  }
})

/**
 * Get the exam details of a user by userId, examId, attempt with pagination
 *
 * @author Hien
 * @route GET /user-result-detail
 * @query userId, examId, attempt, start, size
 * @returns {Promise<Object>} A JSON object containing the user's exam details with pagination
 */
router.get('/user-result-detail', isAuthenticated, async (req, res) => {
  try {
    const {
      userId,
      examId,
      attempt,
      start = '0',
      size = '10'
    } = req.query

    if (!userId || !examId || !attempt) {
      return res.status(400).json({ message: 'No userId, examId or attempt provided' })
    }

    // Calculate pagination values
    const offset = Math.max(parseInt(start, 10) || 0, 0)
    const limit = Math.max(parseInt(size, 10) || 10, 1)

    // Get exam info
    const examInfo = await models.Exam.findOne({ where: { id: examId } })
    if (!examInfo) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    // Get exam questions with pagination
    const examQuestions = await models.ExamQuestion.findAll({
      where: { examId },
      order: [['order', 'ASC']],
      limit,
      offset
    })

    // Get total count of questions
    const totalQuestions = await models.ExamQuestion.count({
      where: { examId }
    })

    const questionIds = examQuestions.map(q => q.questionId)

    const questions = await models.Question.findAll({
      where: { id: questionIds }
    })

    // Sort question
    const sortedQuestions = examQuestions.map(examQ => {
      const question = questions.find(q => q.id === examQ.questionId)
      return {
        ...question.dataValues,
        order: examQ.order
      }
    }).sort((a, b) => a.order - b.order)

    // Get user answers for the paginated questions
    const userAnswers = await models.UserAnswerHistory.findAll({
      where: {
        userId,
        examId,
        attempt,
        questionId: questionIds
      }
    })

    // Get exam room record for the user
    const examRoomRecord = await models.UserEnterExitExamRoom.findOne({
      where: { userId, examId, attempt }
    })

    const detail = sortedQuestions.map(q => {
      const answer = userAnswers.find(a => a.questionId === q.id)
      return {
        id: q.id,
        order: q.order,
        content: q.content,
        type: q.type,
        a: q.a,
        b: q.b,
        c: q.c,
        d: q.d,
        e: q.e,
        f: q.f,
        g: q.g,
        h: q.h,
        i: q.i,
        j: q.j,
        k: q.k,
        l: q.l,
        m: q.m,
        n: q.n,
        o: q.o,
        p: q.p,
        userAnswer: answer?.userAnswer || null,
        isCorrect: answer?.isCorrect || false,
        score: answer ? answer.score : null,
        correctAnswer: q.answer,
        explanation: q.explanation
      }
    })

    res.json({
      userId,
      examId,
      attempt,
      examName: examInfo.name,
      numberOfAttempt: examInfo.numberOfAttempt,
      score: examRoomRecord?.score ?? null,
      enterTime: examRoomRecord?.enterTime || null,
      exitTime: examRoomRecord?.exitTime || null,
      questions: detail,
      meta: {
        total: totalQuestions,
        start: offset,
        size: limit,
        totalPages: Math.ceil(totalQuestions / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id/:attempt?/flagged-ids', isAuthenticated, async (req, res) => {
  try {
    const examId = req.params.id
    const userId = req.user.id
    const requestedAttempt = req.params.attempt
    const lastAttempt = await getLastUserAttemptById(userId, examId)
    const finalAttempt = requestedAttempt || lastAttempt
    const tempAnswers = await getTempUserAnswer(userId, examId, finalAttempt)
    const flaggedQuestions = tempAnswers
      .filter(answer => answer.isFlagged)
      .map(answer => ({
        questionId: answer.questionId,
        page: answer.page
      }))
    res.json({
      flaggedQuestions
    })
  } catch (error) {
    console.error('Error getting flagged question IDs:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
router.get('/:id/:attempt?/tempt-answers', isAuthenticated, async (req, res) => {
  try {
    const examId = req.params.id
    const userId = req.user.id
    const requestedAttempt = req.params.attempt
    const lastAttempt = await getLastUserAttemptById(userId, examId)
    const finalAttempt = requestedAttempt || lastAttempt

    const tempAnswers = await getTempUserAnswer(userId, examId, finalAttempt)

    res.json({
      tempAnswers: tempAnswers.map(answer => ({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isFlagged: answer.isFlagged,
        page: answer.page
      }))
    })
  } catch (error) {
    console.error('Error getting temporary answers:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
router.get('/:id/:attempt?', isAuthenticated, async (req, res) => {
  try {
    const requestedExamId = req.params.id
    const loginedUserId = req.user.id
    const requestedStatus = req.query.status

    // Thêm pagination
    const page = parseInt(req.query.page) || 1 // Trang mặc định là 1
    const limit = parseInt(req.query.limit) || 10 // Số câu hỏi mỗi trang, mặc định 10
    const offset = (page - 1) * limit

    // Lấy thông tin bài thi
    const { listQuestionsWithDetailOfExam, examInfo, totalQuestions } = await getExamInfoWithDetails(requestedExamId, limit, offset)

    // Determine attempt number
    let requestedAttempt
    let lastAttempt

    // If it is a test and the client does not provide an attempt, create a new attempt = max(attempt)
    if (requestedStatus === 'test' && !req.params.attempt) {
      // Get the highest attempt number of the user
      const lastRecord = await models.UserEnterExitExamRoom.findOne({
        where: {
          userId: loginedUserId,
          examId: requestedExamId
        },
        order: [['attempt', 'DESC']]
      })
      lastAttempt = lastRecord ? lastRecord.attempt : 0
      requestedAttempt = lastAttempt + 1
    } else {
      // If attempt or 'view' is provided, use the provided attempt
      // If no attempt is provided, use the last
      lastAttempt = await getLastUserAttemptById(loginedUserId, requestedExamId)
      requestedAttempt = req.params.attempt ? parseInt(req.params.attempt) : lastAttempt
    }

    // Lấy lịch sử câu trả lời của user
    const { lastAtemptUserAnswer, lastExamRoomRecord } = await getUserAnswerHistory(loginedUserId, requestedExamId, requestedAttempt)

    const lastUpdatedExamRoomRecord = await doEnterRoomProcedure(
      lastExamRoomRecord, loginedUserId, requestedExamId, requestedStatus
    )
    const sessionId = lastUpdatedExamRoomRecord.sessionId
    const tempUserAnswer = await getTempUserAnswer(loginedUserId, requestedExamId)
    const dataThisAttemptRecord = await models.UserEnterExitExamRoom.findOne({
      where: {
        userId: loginedUserId,
        examId: requestedExamId,
        attempt: requestedAttempt
      }
    })
    let numberOfCorrectAnswers = 0
    if (requestedStatus === 'view' && lastAtemptUserAnswer) {
      numberOfCorrectAnswers = lastAtemptUserAnswer.filter(answer => answer.isCorrect === true).length
    }

    // Tạo danh sách câu hỏi trả về
    const result = listQuestionsWithDetailOfExam.map((questionData) => {
      const userQuestionData = lastAtemptUserAnswer?.find(
        (data) => data.questionId === questionData.id
      )
      let explanation = null
      let correctAnswer = null
      let isCorrect = null
      let userAnswer = null
      let isFlagged = false
      let score = null

      if (requestedStatus === 'view') {
        explanation = questionData.explanation
        correctAnswer = questionData.answer
        isCorrect = userQuestionData?.isCorrect || false
        userAnswer = userQuestionData?.userAnswer || null
        score = userQuestionData?.score || 0
      }

      const tempUserAnswerData = tempUserAnswer?.find(
        (data) => data.questionId === questionData.id
      )
      if (requestedStatus === 'test') {
        userAnswer = tempUserAnswerData?.userAnswer
        isFlagged = tempUserAnswerData?.isFlagged || false
      }

      return {
        id: questionData.id,
        order: questionData.order,
        title: questionData.content,
        type: questionData.type,
        a: questionData.a,
        b: questionData.b,
        c: questionData.c,
        d: questionData.d,
        e: questionData.e,
        f: questionData.f,
        g: questionData.g,
        h: questionData.h,
        i: questionData.i,
        j: questionData.j,
        k: questionData.k,
        l: questionData.l,
        m: questionData.m,
        n: questionData.n,
        o: questionData.o,
        p: questionData.p,
        userAnswer,
        isCorrect,
        explanation,
        score,
        correctAnswer,
        isFlagged
      }
    })

    res.json({
      id: examInfo.id,
      sessionId,
      name: examInfo.name,
      description: examInfo.description,
      answerVisible: examInfo.answerVisible,
      numberOfAttempt: examInfo.numberOfAttempt,
      durationInMinute: examInfo.durationInMinute,
      pointToPass: examInfo.pointToPass,
      attempted: requestedAttempt,
      lastAttempted: lastAttempt,
      enterTime: requestedStatus === 'test' ? lastUpdatedExamRoomRecord?.enterTime : dataThisAttemptRecord?.enterTime,
      exitTime: requestedStatus === 'test' ? lastUpdatedExamRoomRecord?.exitTime : dataThisAttemptRecord?.exitTime || null,
      score: requestedStatus === 'view' ? dataThisAttemptRecord?.score : null,
      numberOfCorrectAnswers: requestedStatus === 'view' ? numberOfCorrectAnswers : null,
      totalQuestions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit),
      questions: result,
      numberOfAnswered: requestedStatus === 'test'
        ? tempUserAnswer?.filter(ans => ans.userAnswer != null && ans.userAnswer !== '').length || 0
        : lastAtemptUserAnswer?.filter(ans => ans.userAnswer != null && ans.userAnswer !== '').length || 0
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/:id', isAuthenticated, validateSession, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id
    const response = await submitExam(loginedUserId, requestedExamId)
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
const submitExam = async (userId, examId) => {
  // Lấy thông tin bài thi và bản ghi attempt
  const examInfo = await getExamById(examId)
  const lastAttempt = await getLastAttemptedRecord(userId, examId)
  if (hasOverAttempt(examInfo.numberOfAttempt, lastAttempt?.attempt)) {
    throw new Error('Too many attempts!')
  }
  const lastExamRoomRecord = await getLastExamRoomRecord(userId, examId)
  if (!lastExamRoomRecord) {
    throw new Error('Something went wrong with exam room record')
  }
  await doExitRoomProcedure(lastExamRoomRecord)

  // Lấy danh sách tất cả câu hỏi của bài thi
  const listQuestions = await getAllQuestionInExam(examId)
  const tempUserAnswers = await models.TempUserAnswer.findAll({
    where: { userId, examId }
  })
  const answerData = {}
  tempUserAnswers.forEach(ans => {
    answerData[ans.questionId] = ans.userAnswer
  })
  const numberOfAnswered = tempUserAnswers.length
  // Tính toán lại: điểm tối đa là 100, mỗi câu đúng chia đều số điểm
  const maxExamScore = 100
  const perQuestionScore = listQuestions.length > 0 ? maxExamScore / listQuestions.length : 0
  let scoreAcquired = 0

  // Xử lý từng câu hỏi
  let data = listQuestions.map((question) => {
    const userAnswer = answerData[question.id] || null
    const isThisAnswerCorrect = checkIfCorrect(
      question.type,
      userAnswer,
      question.answer
    )
    const questionScore = isThisAnswerCorrect ? perQuestionScore : 0
    if (isThisAnswerCorrect) scoreAcquired += perQuestionScore
    return {
      userId,
      examId,
      questionId: question.id,
      userAnswer,
      isCorrect: isThisAnswerCorrect,
      score: questionScore
    }
  })

  // Kiểm tra thời gian làm bài (nếu làm muộn thì gán điểm về 0)
  const lastUpdatedExamRoomRecord = await getLastExamRoomRecord(userId, examId)
  const roomEnterTime = new Date(lastUpdatedExamRoomRecord.enterTime)
  const roomExitTime = new Date(lastUpdatedExamRoomRecord.exitTime)
  const examDurationInMiliSecond = examInfo.durationInMinute * 60 * 1000
  if (
    examInfo.durationInMinute &&
    examDurationInMiliSecond !== 0 &&
    roomExitTime - roomEnterTime > examDurationInMiliSecond
  ) {
    scoreAcquired = 0
    // Reset từng câu về 0 điểm nếu quá giờ
    data = data.map((d) => ({
      ...d,
      score: 0,
      isCorrect: false
    }))
  }

  const overAllScore = `${Math.round(scoreAcquired)} / ${maxExamScore}`
  const currentAttempt = lastExamRoomRecord.attempt
  data = data.map((d) => ({
    ...d,
    attempt: currentAttempt,
    overAllScore
  }))

  // Lưu kết quả nộp bài
  const userAnswerHistory = await models.UserAnswerHistory.bulkCreate(data)
  // Xoá dữ liệu tạm
  await models.TempUserAnswer.destroy({
    where: { examId, userId }
  })
  // Gọi doExitRoomProcedure với tham số mới là điểm tổng (scoreAcquired)
  await doExitRoomProcedure(lastExamRoomRecord, Math.round(scoreAcquired))

  return {
    userAnswerHistory,
    numberOfAnswered,
    totalQuestion: listQuestions.length,
    overAllScore,
    scoreAcquired: Math.round(scoreAcquired)
  }
}
const getAllQuestionInExam = async (examId) => {
  // Bước 1: Lấy danh sách questionId từ bảng ExamQuestion
  const examQuestions = await models.ExamQuestion.findAll({
    where: { examId }
  })

  // Bước 2: Lấy danh sách questionId
  const questionIds = examQuestions.map(eq => eq.questionId)

  // Bước 3: Lấy thông tin Question dựa trên danh sách questionId
  if (questionIds.length === 0) return []

  return await models.Question.findAll({
    where: {
      id: { [Op.in]: questionIds }
    }
  })
}

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '10',
      search: searchCondition,
      examStatus = 'all'
    } = req.query
    const listExams = await models.Exam.findAll()
    const userAnwserHistory = await getUserAnswerByUserId(req.user.id)
    const dataFromDatabase = listExams?.map((exam) => ({
      id: exam.id,
      name: exam.name,
      image: exam.image,
      description: exam.description,
      groupId: exam.groupId,
      courseId: exam.courseId,
      answerVisible: exam.answerVisible,
      attempted:
        userAnwserHistory?.find((e) => exam.id === e.examId)?.attempt ?? null,
      numberOfAttempt: exam.numberOfAttempt,
      durationInMinute: exam.durationInMinute,
      pointToPass: exam.pointToPass,
      createrId: exam.createrId,
      numberOfQuestion: exam.numberOfQuestion,
      publicDate: exam.publicDate,
      publicStatus: exam.publicStatus,
      score:
        userAnwserHistory?.find((e) => exam.id === e.examId)?.overAllScore ?? null
    }))
    const dataAfterNameSearch = applyNameSearch(
      searchCondition,
      dataFromDatabase
    )
    const dataAfterNameAndStatusSearch = applyStatusSearch(
      examStatus,
      dataAfterNameSearch
    )
    const dataOfCurrentWindow = getDataInWindowSize(
      size,
      page,
      dataAfterNameAndStatusSearch
    )

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterNameAndStatusSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    res.json(error)
  }
})

module.exports = router

async function getUserAnswerHistory (loginedUserId, requestedExamId, attempt) {
  const lastExamRoomRecord = await getLastExamRoomRecord(
    loginedUserId,
    requestedExamId
  )

  let lastAtemptUserAnswer = null
  if (attempt) {
    lastAtemptUserAnswer = await getAttemptUserAnswerHistoryById(
      loginedUserId,
      requestedExamId,
      attempt
    )
  }
  return { lastAtemptUserAnswer, lastExamRoomRecord }
}

async function getExamInfoWithDetails (requestedExamId, limit = 10, offset = 0) {
  const examInfo = await getExamById(requestedExamId)
  const listQuestionsOfExam = await getExamQuestionsById(requestedExamId)
  const questionIdsWithOrder = listQuestionsOfExam.map(q => ({
    questionId: q.questionId,
    order: q.order
  }))

  // If there are no questions, return
  if (questionIdsWithOrder.length === 0) {
    return { listQuestionsWithDetailOfExam: [], examInfo, totalQuestions: 0 }
  }

  // Total number of questions to support pagination
  const totalQuestions = questionIdsWithOrder.length

  // Get the questions for the current page,
  const pagedQuestionIdsWithOrder = questionIdsWithOrder
    .sort((a, b) => a.order - b.order)
    .slice(offset, offset + limit)
  // Get detailed information of the questions on the current page
  const pagedQuestionIds = pagedQuestionIdsWithOrder.map(q => q.questionId)
  const questionDetails = await models.Question.findAll({
    where: { id: { [Op.in]: pagedQuestionIds } }
  })

  // Map details to the correct order, include the
  const listQuestionsWithDetailOfExam = pagedQuestionIdsWithOrder.map(q => {
    const detail = questionDetails.find(d => d.id === q.questionId)
    return {
      ...detail?.get({ plain: true }),
      order: q.order
    }
  })

  return { listQuestionsWithDetailOfExam, examInfo, totalQuestions }
}

function applyStatusSearch (examStatus, inputData) {
  let filteredData = inputData
  if (examStatus === 'done') {
    filteredData = inputData.filter((d) => !!d.score)
  } else if (examStatus === 'not-done') {
    filteredData = inputData.filter((d) => !d.score)
  }
  return filteredData
}

function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.name?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
    )
  }
  return data
}

function getDataInWindowSize (size, page, data) {
  if (!isNaN(Number(size)) && !isNaN(Number(page))) {
    data = data.slice(
      Number(size) * (Number(page) - 1),
      Number(size) * Number(page)
    )
  }
  return data
}

async function getUserAnswerByUserId (userId) {
  return await models.UserAnswerHistory.findAll({
    where: { userId },
    order: [['id', 'DESC']]
  })
}

async function getAllQuestionInList (listQuestionIds) {
  return await models.Question.findAll({
    where: {
      id: {
        [Sequelize.Op.or]: listQuestionIds
      }
    }
  })
}

async function getLastAttemptedRecord (userId, examId) {
  return await models.UserEnterExitExamRoom.findOne({
    where: { examId, userId, exitTime: { [Sequelize.Op.ne]: null } },
    order: [['attempt', 'DESC']]
  })
}

async function getExamById (examId) {
  return await models.Exam.findOne({
    where: {
      id: examId
    }
  })
}
async function getExamQuestionsById (examId) {
  return await models.ExamQuestion.findAll({
    where: { examId },
    attributes: ['questionId', 'order'],
    order: [['order', 'ASC']]
  })
}
async function getAttemptUserAnswerHistoryById (userId, examId, attempt) {
  return await models.UserAnswerHistory.findAll({
    where: {
      examId,
      userId,
      attempt
    },
    order: [['id', 'DESC']]
  })
}

async function getLastUserAttemptById (userId, examId) {
  const lastAttempt = await models.UserAnswerHistory.findOne({
    where: {
      examId,
      userId
    },
    order: [['id', 'DESC']]
  })
  return lastAttempt?.attempt
}

async function getLastExamRoomRecord (userId, examId) {
  return await models.UserEnterExitExamRoom.findOne({
    where: {
      examId,
      userId
    },
    order: [['id', 'DESC']]
  })
}

async function getTempUserAnswer (userId, examId) {
  return await models.TempUserAnswer.findAll({
    where: {
      examId,
      userId
    }
  })
}

async function doEnterRoomProcedure (examRoomRecord, loginedUserId, requestedExamId, requestedStatus) {
  // Create a new sessionId
  const sessionId = generateSessionId()
  if (requestedStatus === 'test') {
    if (examRoomRecord == null) {
      await models.UserEnterExitExamRoom.bulkCreate([{
        userId: loginedUserId,
        examId: requestedExamId,
        enterTime: Sequelize.fn('NOW'),
        attempt: 1,
        sessionId
      }])
    } else if (examRoomRecord.enterTime != null && examRoomRecord.exitTime != null) {
      await models.UserEnterExitExamRoom.bulkCreate([{
        userId: loginedUserId,
        examId: requestedExamId,
        enterTime: Sequelize.fn('NOW'),
        attempt: examRoomRecord.attempt + 1,
        sessionId
      }])
    } else {
      if (!examRoomRecord.sessionId || examRoomRecord.sessionId !== sessionId) {
        await models.UserEnterExitExamRoom.update(
          { sessionId },
          {
            where: {
              id: examRoomRecord.id
            }
          }
        )
      } else {
        console.log('>>> Session already has this ID, skipping update')
      }
    }
  } else if (examRoomRecord == null) {
    await models.UserEnterExitExamRoom.bulkCreate([{
      userId: loginedUserId,
      examId: requestedExamId,
      enterTime: Sequelize.fn('NOW'),
      attempt: 1,
      sessionId
    }])
  }
  return await getLastExamRoomRecord(loginedUserId, requestedExamId)
}

async function doExitRoomProcedure (lastExamRoomRecord, score) {
  // Get exam info to get duration
  const exam = await models.Exam.findOne({ where: { id: lastExamRoomRecord.examId } })
  const enterTime = new Date(lastExamRoomRecord.enterTime).getTime()
  const duration = exam.durationInMinute * 60 * 1000
  const maxExitTime = enterTime + duration
  const now = Date.now()

  // If the current time is greater than maxExitTime, set exitTime =
  const exitTimeToSet = now > maxExitTime ? new Date(maxExitTime) : new Date(now)

  lastExamRoomRecord.set({
    exitTime: exitTimeToSet,
    score
  })
  await lastExamRoomRecord.save()
}
