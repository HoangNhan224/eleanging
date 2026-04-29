/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable brace-style */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const sequelize = require('../models/init')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { API_PREFIX } = require('../utils')
const { Op, Sequelize } = require('sequelize')

/**
 * Retrieves filtered questions by category with pagination.
 *
 * @route GET /filter-by-category
 * @param {Object} req.query - Query parameters for filtering and pagination:
 *   {string} filterOption - Filter by category: "COURSE", "GROUP", or "ALL".
 *   {string} questionTypeFilter - Filter by question type: "SINGLE_CHOICE", "MULTIPLE_CHOICE", or "ALL".
 *   {string} examUsageFilter - Filter by exam usage: "USED", "NOT_USED", or "ALL".
 *   {number|string} start - Starting index for pagination (default 0).
 *   {number|string} size - Number of records per page (default 25).
 * @returns {Promise<Object>} A JSON object containing the filtered questions and pagination metadata.
 * @throws {Error} If input parameters are invalid or an error occurs during retrieval.
 */
router.get('/filter-by-category', isAuthenticated, async (req, res) => {
  try {
    const {
      filterOption,
      questionTypeFilter,
      examUsageFilter,
      search,
      start = 0,
      size = 25
    } = req.query

    // TODO: Calculate pagination values ensuring valid offset and limit.
    const rawTargetId = req.query.targetId ?? req.query.target_id ?? req.query.targetid ?? null
    const offset = Math.max(parseInt(start, 10) || 0, 0)
    const limit = Math.max(parseInt(size, 10) || 25, 1)
    const where = {}

    if (search && String(search).trim() !== '') {
      where[Op.or] = [
        { content: { [Op.like]: `%${String(search).trim()}%` } },
        { instruction: { [Op.like]: `%${String(search).trim()}%` } }
      ]
    }

    // TODO: Apply category filter if filterOption is provided and not "ALL".
    if (filterOption && filterOption !== 'ALL') {
      if (filterOption === 'COURSE' || filterOption === 'GROUP') {
        where.category = filterOption
      } else {
        return res.status(400).json({
          message: 'FILTER_OPTION NOT VALID. ONLY ACCEPT "COURSE" OR "GROUP".'
        })
      }
    }

    // TODO: Apply question type filter if questionTypeFilter is provided and not "ALL".
    if (questionTypeFilter && questionTypeFilter !== 'ALL') {
      if (questionTypeFilter === 'SINGLE_CHOICE' || questionTypeFilter === 'MULTIPLE_CHOICE') {
        where.type = questionTypeFilter
      } else {
        return res.status(400).json({
          message: 'QUESTION_TYPE_FILTER NOT VALID. ONLY ACCEPT "SINGLE_CHOICE" OR "MULTIPLE_CHOICE".'
        })
      }
    }

    let examIncludeRequired = false
    // TODO: Apply exam usage filter: set join requirement for used questions or exclude questions not used.
    if (examUsageFilter && examUsageFilter !== 'ALL') {
      if (examUsageFilter === 'USED') {
        examIncludeRequired = true
      } else if (examUsageFilter === 'NOT_USED') {
        // TODO: Exclude questions that exist in the exams_questions table.
        where.id = {
          [Op.notIn]: Sequelize.literal('(SELECT questionId FROM exams_questions)')
        }
      } else {
        return res.status(400).json({
          message: 'EXAM_USAGE_FILTER NOT VALID. ONLY ACCEPT "USED" OR "NOT_USED".'
        })
      }
    }

    if (rawTargetId !== null && rawTargetId !== undefined && !isNaN(Number(rawTargetId))) {
      where.target_id = Number(rawTargetId)
    }

    // TODO: Retrieve the filtered questions with pagination and include related Exam data.
    const { rows, count } = await models.Question.findAndCountAll({
      where,
      offset,
      limit,
      order: [['id', 'DESC']],
      distinct: true,
      include: [
        {
          model: models.Exam,
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: examIncludeRequired
        }
      ]
    })

    // TODO: Return the result along with pagination metadata.
    return res.json({
      count,
      data: rows,
      meta: {
        total: count,
        start: offset,
        size: limit,
        targetId: rawTargetId ? Number(rawTargetId) : null
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const questions = await models.Question.findAll()
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})
/**
 * Retrieves questions associated with a specific exam, ordered by the exam question order.
 *
 * @route GET /exam/:id
 * @param {string} req.params.id - The exam ID for which to retrieve questions.
 * @returns {Promise<Object>} A JSON array containing questions linked to the exam.
 * @throws {Error} If the exam ID is invalid or an error occurs during retrieval.
 */
router.get('/exam/list/:id', isAuthenticated, async (req, res) => {
  try {
    // TODO: Parse the exam ID from request parameters and validate it.
    const examId = parseInt(req.params.id)
    if (isNaN(examId)) {
      return res.status(400).json({ error: 'Invalid exam id' })
    }
    // TODO: Log the valid exam ID for debugging purposes.
    console.log('check examId', examId)

    // TODO: Retrieve questions linked to the specified exam.
    const questions = await models.Question.findAll({
      include: [
        {
          model: models.Exam,
          where: { id: examId },
          attributes: [],
          through: { attributes: ['order'] }
        }
      ],
      // TODO: Order the results by the exam question order in ascending order.
      order: [[models.Exam, models.ExamQuestion, 'order', 'ASC']]
    })

    // TODO: Return the retrieved questions as JSON.
    res.json(questions)
  } catch (error) {
    // TODO: Log the error and return a 500 Internal Server Error response.
    console.error('Error fetching exam questions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Retrieves questions associated with a specific exam, ordered by the exam question order, with pagination.
 *
 * @route GET /exam/:id
 * @param {string} req.params.id - The exam ID for which to retrieve questions.
 * @param {Object} req.query - Query parameters for pagination:
 *   {number|string} start - Starting index for pagination (default 0).
 *   {number|string} size - Number of records per page (default 25).
 * @returns {Promise<Object>} A JSON object containing questions linked to the exam and pagination metadata.
 * @throws {Error} If the exam ID is invalid or an error occurs during retrieval.
 */
router.get('/exam/:id', isAuthenticated, async (req, res) => {
  console.log('Route /exam/:id is being called')
  try {
    const examId = parseInt(req.params.id, 10)
    if (isNaN(examId)) {
      return res.status(400).json({ error: 'Invalid exam id' })
    }

    const { start = 0, size = 25, search = '' } = req.query
    const offset = Math.max(parseInt(start, 10) || 0, 0)
    const limit = Math.max(parseInt(size, 10) || 25, 1)
    const where = {}
    if (search && search.trim() !== '') {
      where.text = { [Op.like]: `%${search.trim()}%` }
    }

    const { rows, count } = await models.Question.findAndCountAll({
      where,
      include: [
        {
          model: models.Exam,
          where: { id: examId },
          attributes: [],
          through: {
            attributes: []
          },
          required: true
        }
      ],
      order: [
        [models.Exam, models.ExamQuestion, 'order', 'ASC']
      ],
      offset,
      limit,
      subQuery: false
    })

    res.json({
      data: rows,
      meta: {
        total: count,
        start: offset,
        size: limit
      }
    })
  } catch (error) {
    console.error('Error fetching exam questions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Updates a question's details or duplicates the question for a specific exam.
 *
 * @route PUT /:id
 * @param {string} req.params.id - The ID of the question to update.
 * @param {Object} req.body - The updated question details including instruction, content, choices (a to p), answer, explanation, type, category and optionally examId.
 * @returns {Promise<Object>} A JSON object containing the updated or duplicated question.
 * @throws {Error} If the question is not found or an error occurs during update/duplication.
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const {
      instruction,
      content,
      a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p,
      answer,
      explanation,
      type,
      category,
      examId
    } = req.body

    // TODO: Retrieve the question to update based on the provided id.
    const question = await models.Question.findOne({ where: { id: req.params.id } })
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }

    // TODO: If examId is provided, determine whether to duplicate or update the question
    if (examId) {
      // TODO: Retrieve the existing exam question record associated with the given exam.
      const oldExamQuestion = await models.ExamQuestion.findOne({
        where: { examId, questionId: question.id }
      })
      const oldOrder = oldExamQuestion?.order || 1
      const oldCategory = question.category
      // TODO: Count how many exam associations exist for this question.
      const eqCount = await models.ExamQuestion.count({ where: { questionId: question.id } })

      // TODO: If the question is linked with multiple exams, duplicate it for the specified exam.
      if (eqCount > 1) {
        const newQuestion = await models.Question.create({
          instruction,
          content,
          a,
          b,
          c,
          d,
          e,
          f,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          n,
          o,
          p,
          answer,
          explanation,
          type,
          category: category || oldCategory
        })
        await newQuestion.update({ target_id: newQuestion.id })

        // TODO: Remove the association of the original question with the specified exam.
        await models.ExamQuestion.destroy({
          where: {
            examId,
            questionId: question.id
          }
        })

        // TODO: Create a new association for the duplicated question with the prior order.
        await models.ExamQuestion.create({
          examId,
          questionId: newQuestion.id,
          order: oldOrder
        })
        return res.json({ message: 'Question duplicated for this exam', newQuestion })
      } else {
        // TODO: If the question is linked with only one exam, update it directly.
        const newQuestion = await question.update({
          instruction,
          content,
          a,
          b,
          c,
          d,
          e,
          f,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          n,
          o,
          p,
          answer,
          explanation,
          type,
          category
        })
        return res.json({ message: 'Question duplicated for this exam', newQuestion })
      }
    } else {
      // TODO: If no examId is provided, perform a normal update of the question.
      const updatedQuestion = await question.update({
        instruction,
        content,
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
        k,
        l,
        m,
        n,
        o,
        p,
        answer,
        explanation,
        type,
        category
      })
      return res.json(updatedQuestion)
    }
  } catch (error) {
    // TODO: Log the error and return a 500 Internal Server Error response.
    console.error('Error updating or duplicating question:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Duplicates exam questions and updates their order for a specific exam.
 *
 * @route PUT /:examId/update
 * @param {string} req.params.examId - The exam ID.
 * @param {Object} req.body - Contains:
 *   {Array<number>} leftQuestionIds - An array of question IDs to be added.
 *   {Array<Object>} orderData - An array of objects with questionId and order to update sorting.
 * @returns {Promise<Object>} A JSON object with a success message upon completion.
 * @throws {Error} If examId is invalid or if an error occurs during transaction.
 */
router.put('/:examId/update', isAuthenticated, async (req, res) => {
  try {
    // TODO: Validate and parse examId from the request parameters.
    const examId = parseInt(req.params.examId, 10)
    if (isNaN(examId)) {
      return res.status(400).json({ message: 'Invalid examId' })
    }

    const { leftQuestionIds, orderData } = req.body

    // TODO: Start a transaction to safely create associations and update ordering.
    await sequelize.transaction(async (t) => {
      // TODO: Create associations in ExamQuestion for each question ID provided in leftQuestionIds.
      for (const qId of leftQuestionIds) {
        await models.ExamQuestion.create(
          { examId, questionId: qId },
          { transaction: t }
        )
      }

      // TODO: Update the order for each exam question using the provided orderData.
      for (const item of orderData) {
        await models.ExamQuestion.update(
          { order: item.order },
          {
            where: {
              examId,
              questionId: item.questionId
            },
            transaction: t
          }
        )
      }
    })

    // TODO: Return success response if transaction completes without error.
    return res.status(200).json({ message: 'ExamQuestion created and order updated successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Updates the order of exam questions for a specific exam.
 *
 * @route PUT /:examId/update-order
 * @param {string} req.params.examId - The exam ID.
 * @param {Object} req.body - Contains:
 *   {Array<Object>} orderData - An array of objects with questionId and order to update sorting.
 * @returns {Promise<Object>} A JSON object with a success message if the update is successful.
 * @throws {Error} If examId is invalid, orderData is not valid, or an error occurs during update.
 */
router.put('/:examId/update-order', isAuthenticated, async (req, res) => {
  try {
    // TODO: Parse the examId from the request parameters and validate it.
    const examId = parseInt(req.params.examId)
    if (isNaN(examId)) {
      return res.status(400).json({ message: 'Invalid examId' })
    }

    const { orderData } = req.body
    // TODO: Validate that orderData is an array.
    if (!Array.isArray(orderData)) {
      return res.status(400).json({ message: 'orderData must be an array' })
    }

    // TODO: For each item in orderData, update the corresponding ExamQuestion record with the new order.
    for (const item of orderData) {
      await models.ExamQuestion.update(
        { order: item.order + 1 },
        {
          where: {
            examId,
            questionId: item.questionId
          }
        }
      )
    }

    // TODO: Return a success message upon successful update.
    return res.status(200).json({ message: 'Order updated successfully' })
  } catch (error) {
    // TODO: Log the error and return a 500 Internal Server Error response.
    console.error('Error updating question order:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Creates a new question and optionally associates it with an exam.
 *
 * @route POST /
 * @param {Object} req.body - The new question details including:
 *   {string} instruction - The question instruction.
 *   {string} content - The question content.
 *   {string} a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p - The question choices.
 *   {string} answer - The correct answer(s) for the question.
 *   {string} explanation - The explanation for the answer.
 *   {string} category - The category of the question.
 *   {number} [examId] - Optional exam ID to associate the question with.
 * @returns {Promise<Object>} A JSON object containing the created question details.
 * @throws {Error} If required fields are missing or an error occurs during creation.
 */
router.post('/', isAuthenticated, async (req, res) => {
  console.log('check----------')
  try {
    // TODO: Destructure question details from request body.
    const {
      instruction,
      content,
      a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p,
      answer,
      explanation,
      category,
      examId,
      courseId,
      groupId
    } = req.body

    console.log(req.body)
    // TODO: Validate that required fields (content and answer) are provided.
    if (!content || !answer) {
      return res.status(400).json({ message: 'Các trường bắt buộc content, answer là bắt buộc' })
    }
    // TODO: Determine if the question is multiple choice based on the answer format.
    const isMultipleChoice = answer.includes('::')
    const type = isMultipleChoice ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'

    // TODO: Create a new question record in the database.
    const newQuestion = await models.Question.create({
      instruction,
      content,
      a,
      b,
      c,
      d,
      e,
      f,
      g,
      h,
      i,
      j,
      k,
      l,
      m,
      n,
      o,
      p,
      answer,
      explanation,
      type,
      category
    })

    // TODO: If examId is provided, associate the new question with the specified exam.
    if (examId) {
      // TODO: Retrieve the exam record to determine the proper category.
      const examRecord = await models.Exam.findOne({
        where: { id: parseInt(examId, 10) }
      })
      if (examRecord) {
        // TODO: Determine the final category based on the exam record's courseId or groupId.
        let finalCategory = category
        if (examRecord.courseId) {
          finalCategory = 'COURSE'
        } else if (examRecord.groupId) {
          finalCategory = 'GROUP'
        }
        // TODO: Update the question with the determined category.
        await newQuestion.update({
          category: finalCategory
        })
      }
      // TODO: Determine the new order for the question within the exam.
      const maxOrder = await models.ExamQuestion.max('order', {
        where: { examId: parseInt(examId, 10) }
      })
      const newOrder = maxOrder === null ? 1 : maxOrder + 1
      // TODO: Create the association between the exam and the question with the determined order.
      await models.ExamQuestion.create({
        examId: parseInt(examId, 10),
        questionId: newQuestion.id,
        order: newOrder
      })
    }
    try {
      const targetId = courseId || groupId || null
      if (targetId) {
        await newQuestion.update({ target_id: targetId })
      }
    } catch (err) {
      console.error('Failed to set target_id for question:', err)
    }

    // TODO: Return the newly created question details as JSON response.
    return res.status(200).json(newQuestion)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Creates multiple questions in bulk and optionally associates them with an exam.
 *
 * @route POST /bulk
 * @param {Object} req.body - The request body containing:
 *   {Array<Object>} questions - Array of question objects, each must have "content" and "answer".
 *   {string} category - The default category for the questions.
 * @returns {Promise<Object>} A JSON array containing the created question details.
 * @throws {Error} If no questions are provided or an error occurs during creation.
 */
router.post('/bulk', isAuthenticated, async (req, res) => {
  try {
    const { questions, category } = req.body
    console.log('check----------', req.body)

    // TODO: Validate that questions is a non-empty array.
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Không có câu hỏi nào để tạo' })
    }

    const answerFields = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p']

    // TODO: Validate each question, ensure required fields are provided, and set question type.
    for (const q of questions) {
      if (!q.content || !q.answer) {
        return res.status(400).json({ message: 'Mỗi câu hỏi phải có trường "content" và "answer"' })
      }
      // Determine question type based on answer format.
      q.type = q.answer.includes('::') ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'
      // Map provided answers array to answer fields if available.
      if (Array.isArray(q.answers)) {
        answerFields.forEach((field, index) => {
          q[field] = q.answers[index] || null
        })
      }
      if (category && !q.category) {
        q.category = category
      }
    }

    // TODO: Bulk create questions in the database with returning the created records.
    const createdQuestions = await models.Question.bulkCreate(questions, { returning: true })

    try {
      await Promise.all(createdQuestions.map(async (createdQ, idx) => {
        const src = questions[idx] || {}
        const targetId = src.courseId || src.groupId || null
        if (targetId) {
          await createdQ.update({ target_id: targetId })
        }
      }))
    } catch (err) {
      console.error('Failed to set target_id for bulk questions:', err)
    }

    const examId = questions[0].examId
    if (examId) {
      // TODO: Retrieve the exam record to determine the proper category.
      const examRecord = await models.Exam.findOne({
        where: { id: parseInt(examId, 10) }
      })
      if (examRecord) {
        let finalCategory = category
        let targetIdFromExam = null
        if (examRecord.courseId) {
          finalCategory = 'COURSE'
          targetIdFromExam = examRecord.courseId
        } else if (examRecord.groupId) {
          finalCategory = 'GROUP'
          targetIdFromExam = examRecord.groupId
        }
        // TODO: Update each created question with the determined final category and target_id.
        await Promise.all(createdQuestions.map(async (q) => {
          const updateData = { category: finalCategory }
          // Only set target_id from exam if not already set from courseId/groupId in payload
          if (targetIdFromExam && !q.target_id) {
            updateData.target_id = targetIdFromExam
          }
          await q.update(updateData)
        }))
      }

      // TODO: Determine the starting order by finding the maximum existing order for the exam.
      const baseOrder = await models.ExamQuestion.max('order', {
        where: { examId: parseInt(examId, 10) }
      })
      const startingOrder = baseOrder === null ? 1 : baseOrder + 1

      // TODO: Create associations in ExamQuestion for each newly created question with incrementing order.
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (q.examId) {
          await models.ExamQuestion.create({
            examId: parseInt(q.examId, 10),
            questionId: createdQuestions[i].id,
            order: startingOrder + i
          })
        }
      }
    }

    return res.status(200).json(createdQuestions)
  } catch (error) {
    console.error('Bulk create error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Deletes multiple questions at once by their IDs.
 *
 * @author Hien
 * @route DELETE /delete-bulk
 * @param {Object} req.body - The request body containing:
 *   {Array<number>} questionIds - Array of question IDs to delete.
 * @returns {Promise<Object>} A JSON object with a success message and count of deleted questions.
 * @throws {Error} If questionIds is not an array or empty, questions are referenced in other records,
 *                 or an error occurs during deletion.
 */
router.delete('/delete-bulk', isAuthenticated, async (req, res) => {
  try {
    const { questionIds } = req.body
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'questionIds must be a non-empty array' })
    }
    const deletedCount = await models.Question.destroy({
      where: { id: questionIds }
    })
    return res.json({ message: `Deleted ${deletedCount} questions successfully` })
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('Cannot delete question due to foreign key constraint:', error)
      return res.status(400).json({ message: 'Cannot delete question because it is referenced in other records.' })
    }
    console.error('Error deleting question:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Deletes a question by its ID.
 *
 * @route DELETE /:id
 * @param {string} req.params.id - The ID of the question to delete.
 * @returns {Promise<Object>} A JSON object with a success message if deletion is successful.
 * @throws {Error} If the question is not found or an error occurs during deletion.
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // TODO: Retrieve the question based on the provided ID.
    const question = await models.Question.findOne({ where: { id: req.params.id } })

    // TODO: If question not found, return a 404 response.
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }

    // TODO: Delete the retrieved question.
    await question.destroy()

    // TODO: Return a success message as JSON.
    res.json({ message: 'Question deleted' })
  } catch (error) {
    // TODO: Handle foreign key constraint errors specifically.
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('Cannot delete question due to foreign key constraint:', error)
      return res.status(400).json({ message: 'Cannot delete question because it is referenced in other records.' })
    }
    // TODO: Log and return a 500 error for any other unexpected errors.
    console.error('Error deleting question:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Removes the association between a question and an exam.
 *
 * @route DELETE /remove-from-exam/:examId/:questionId
 * @param {string} req.params.examId - The exam ID.
 * @param {string} req.params.questionId - The question ID to remove.
 * @returns {Promise<Object>} A JSON object with a success message if removal is successful.
 * @throws {Error} If the association is not found or an error occurs during removal.
 */
router.delete('/remove-from-exam/:examId/:questionId', isAuthenticated, async (req, res) => {
  try {
    // TODO: Destructure examId and questionId from the request parameters.
    const { examId, questionId } = req.params

    // TODO: Remove the association from the ExamQuestion table.
    const deletedCount = await models.ExamQuestion.destroy({
      where: { examId, questionId }
    })

    // TODO: If no association was found (deletedCount === 0), return a 404 response.
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Association not found' })
    }

    // TODO: Return a success message upon successful removal.
    res.json({ message: 'Question removed from exam successfully' })
  } catch (error) {
    console.error('Error removing question from exam:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Sey up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/questions/')
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
 * Uploads an image for a question.
 *
 * @route POST /upload/image
 * @returns {Promise<Object>} A JSON object containing the URL of the uploaded image.
 * @throws {Error} If no file is uploaded or an error occurs during upload.
 */
router.post('/upload/image', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    // TODO: Ensure a file was uploaded; if not, return a 400 error.
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // TODO: Construct the URL for the uploaded image.
    const imageUrl = `${req.protocol}://${req.get('host')}${API_PREFIX}/uploads/questions/${req.file.filename}`
    // TODO: Return the image URL in a JSON response.
    res.json({ image: imageUrl })
  } catch (error) {
    // TODO: Return a 500 error response if any error occurs during the upload process.
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
const dir = path.resolve(__dirname, '../uploads/questions')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
  console.log('Directory created:', dir)
} else {
  console.log('Directory already exists:', dir)
}
router.get('/exam/:examId/questions/:questionId', isAuthenticated, async (req, res) => {
  try {
    const requestedQuestionId = req.params.questionId
    const examId = req.params.examId
    const question = await models.Question.findByPk(requestedQuestionId)

    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }

    const result = question.toJSON()

    if (!isNaN(examId) && examId) {
      const exam = await models.Exam.findByPk(examId, {
        attributes: ['id', 'name', 'createrId']
      })
      if (exam) {
        result.exam = exam
      }

      const examQuestion = await models.ExamQuestion.findOne({
        where: { examId, questionId: requestedQuestionId },
        attributes: ['order']
      })
      if (examQuestion) {
        result.examQuestion = examQuestion
      }
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching question:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const requestedQuestionId = req.params.id
    const fieldList = 'QD.comment, QD.like, QD.unlike, QD.updatedAt, U.firstName, U.lastName, U.username, U.avatar'
    const joinCondition = 'QD.userId = U.id'
    const whereCondition = ' WHERE QD.questionId = ' + requestedQuestionId
    const order = ' ORDER BY updatedAt DESC'
    const [results] = await sequelize.query(
      'SELECT ' + fieldList + ' FROM question_discussion QD JOIN users U ON ' + joinCondition + whereCondition + order
    )
    res.json(results)
  } catch (error) {
    res.json(error)
  }
})

router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedQuestionId = req.params.id
    if (req.body.data) {
      // Tạo mới bản ghi discussion
      const discussionData = {
        userId: loginedUserId,
        examId: req.body.data.examId,
        questionId: requestedQuestionId,
        comment: req.body.data.comment
      }

      // Sử dụng create (vì chỉ tạo 1 bản ghi)
      const discussion = await models.QuestionDiscussion.create(discussionData)

      // Sau khi tạo, lấy thông tin discussion kèm dữ liệu của user
      const discussionWithUser = await models.QuestionDiscussion.findOne({
        where: { id: discussion.id },
        include: [{
          model: models.User,
          attributes: ['username', 'firstName', 'lastName', 'avatar']
        }]
      })

      // Chuyển đổi đối tượng kết quả thành plain object
      const result = discussionWithUser.toJSON()

      // Flatten thông tin của User ra cùng cấp
      if (result.User) {
        result.username = result.User.username
        result.firstName = result.User.firstName
        result.lastName = result.User.lastName
        result.avatar = result.User.avatar
        delete result.User
      }

      // Gửi thông báo sau khi tạo comment thành công
      await sendCommentNotification(loginedUserId, req.body.data.examId, requestedQuestionId, result.username)

      res.json(result)
    } else {
      res.status(400).send('Bad Request: Missing data')
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

// Hàm gửi thông báo cho comment
// Logic hoàn chỉnh:
// User thường comment → Creator + tất cả user đã comment nhận thông báo
// Creator comment → Tất cả user đã comment nhận thông báo
async function sendCommentNotification (commentUserId, examId, questionId, commenterUsername) {
  try {
    // Lấy thông tin exam và creator
    const exam = await models.Exam.findByPk(examId, {
      attributes: ['createrId', 'name']
    })

    if (!exam) {
      console.log('Exam not found')
      return
    }

    const isCommenterExamCreator = exam.createrId === commentUserId

    let recipientUserIds = []
    let notificationTitle = ''
    let notificationMessage = ''

    if (!isCommenterExamCreator) {
      // RULE 1: User thường comment -> Gửi cho creator của exam
      if (exam.createrId && exam.createrId !== commentUserId) {
        recipientUserIds.push(exam.createrId)
      }

      // RULE 3: User comment -> Gửi cho tất cả user khác đã từng comment câu hỏi đó trong exam
      const previousComments = await models.QuestionDiscussion.findAll({
        where: {
          questionId,
          userId: { [Op.ne]: commentUserId }
        },
        attributes: ['userId'],
        group: ['userId']
      })

      // Thêm các user đã comment vào danh sách nhận thông báo
      const previousCommentUserIds = previousComments.map(comment => comment.userId)
      recipientUserIds = [...new Set([...recipientUserIds, ...previousCommentUserIds])]

      notificationTitle = 'Comment on Question'
      notificationMessage = `${commenterUsername}|${exam.name}`
    } else {
      // RULE 2: Creator của exam comment -> Gửi cho tất cả user đã từng comment câu hỏi đó trong exam
      const previousComments = await models.QuestionDiscussion.findAll({
        where: {
          questionId,
          userId: { [Op.ne]: commentUserId }
        },
        attributes: ['userId'],
        group: ['userId']
      })

      recipientUserIds = previousComments.map(comment => comment.userId)

      notificationTitle = 'Reply from Exam Creator'
      notificationMessage = `${commenterUsername}|${exam.name}`
    }

    // Tạo notification nếu có người nhận
    if (recipientUserIds.length > 0) {
      const notification = await models.Notification.create({
        title: notificationTitle,
        message: notificationMessage,
        url: `/exam/${examId}/question/${questionId}`
      })

      // Tạo notification recipients
      const recipients = recipientUserIds.map(userId => ({
        userId,
        notificationId: notification.id,
        status: false
      }))

      await models.NotificationRecipient.bulkCreate(recipients)
    }
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error)
  }
}

// router.post('/:id', isAuthenticated, async (req, res) => {
//   try {
//     // const requestedExamId = req.params.id
//     const loginedUserId = req.user.id
//     const requestedQuestionId = req.params.id
//     if (req.body.data) {
//       const discussion = [{
//         userId: loginedUserId,
//         examId: req.body.data.examId,
//         questionId: requestedQuestionId,
//         comment: req.body.data.comment
//       }]
//       const response = await models.QuestionDiscussion.bulkCreate(discussion)
//       res.json({
//         response
//       })
//     } else {
//       res.status(400)
//     }
//   } catch (error) {
//     res.json(error)
//   }
// })
module.exports = router
