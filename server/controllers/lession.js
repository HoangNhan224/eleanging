const express = require('express')
const { models, sequelize } = require('../models')
const { isAuthenticated, checkUserPermission } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { infoLogger, errorLogger } = require('../logs/logger')
const { Op } = require('sequelize')

function logError (req, error) {
  const request = req.body.data ? req.body.data : req.params ? req.params : req.query
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error,
    user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : req.params ? req.params : req.query
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user.id
  })
}

const MASSAGE = {
  LESSION_NOT_FOUND: 'Lession not found',
  CATEGORY_LESSION_NOT_FOUND: 'Category Lesions not found for the specified course',
  DELETE_SUCCESS: 'Lession deleted successfully',
  ORDER_U_SS: 'Order updated successfully',
  NAME_EXIST: 'NAME_EXIST',
  LOCATIONPATH_EXIST: 'LOCATIONPATH_EXIST',
  LESSON_REORDER_FAILED: 'Failed to reorder lessons',
  LESSON_REORDER_SUCCESS: 'Lessons reordered successfully',
  LESSON_UPDATE_FAILED: 'Failed to update lesson order',
  FILE_UPLOAD_FAILED: 'Failed to upload file',
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
  CATEGORYLESSION_NOT_FOUND: 'CategoryLession not found.',
  FILE_MAX_SIZE_EXCEEDED: 'File is too large. Maximum size is 10MB.',
  FAILED_TO_CHECK_UPDATES: 'Failed to check updates',
  FAILED_TO_FIRST_LESSION: 'Failed to fetch first incomplete lession'
}

/**
 * Reorders lessons within a category.
 *
 * @author Hien
 * @param {number} categoryId - The ID of the category.
 * @returns {Promise<Object>} A success message if the reordering is successful.
 * @throws {Error} If there is an error during reordering.
 */
async function reorderLessonsInCategory (categoryId) {
  try {
    // TODO Fetch all lessons in the specified category, ordered by their current order
    const lessons = await models.Lession.findAll({
      where: { lessionCategoryId: categoryId },
      order: [['order', 'ASC']]
    })
    // TODO Update the order of each lesson
    for (let i = 0; i < lessons.length; i++) {
      const newOrder = i + 1
      await models.Lession.update({ order: newOrder }, { where: { id: lessons[i].id } })
    }
    // TODO Return a success message
    return { success: true, message: MASSAGE.LESSON_REORDER_SUCCESS }
  } catch (error) {
    console.error('Failed to reorder lessons:', error)
    throw error
  }
}

/**
 * Updates the order of lessons within a category.
 *
 * @author Hien
 * @route POST /update-lession-order
 * @param {Object} req.body.data - The request body containing updated lessons and category lesson ID.
 * @param {Array<Object>} req.body.data.updatedLessons - The array of lessons with updated order.
 * @param {number} req.body.data.categoryLessonId - The ID of the category lesson.
 * @returns {Promise<Object>} A success message if the update is successful.
 * @throws {Error} If there is an error during the update.
 */
router.post('/update-lession-order', isAuthenticated, checkUserPermission, async (req, res) => {
  const { updatedLessons, categoryLessonId } = req.body.data
  try {
    // TODO Start a transaction to update lesson orders
    await sequelize.transaction(async (transaction) => {
      for (const lesson of updatedLessons) {
        await models.Lession.update({ order: lesson.order }, { where: { id: lesson.id }, transaction })
      }
    })
    // TODO Update the checkUpDate for the category lesson
    await models.CategoryLession.update(
      { checkUpDate: new Date() },
      { where: { id: categoryLessonId } }
    )
    logInfo(req, { message: MASSAGE.ORDER_U_SS })
    res.status(200).json({ message: MASSAGE.ORDER_U_SS })
  } catch (error) {
    logError(req, error)
    console.error('Failed to update lesson order:', error)
    if (!res.headersSent) {
      res.status(500).json({ message: MASSAGE.LESSON_UPDATE_FAILED })
    }
  }
})

/**
 * Updates a lesson by its ID.
 *
 * @author Hien
 * @route PUT /:lessionId
 * @param {string} req.params.lessionId - The ID of the lesson.
 * @param {Object} req.body.data - The lesson data to be updated.
 * @returns {Promise<Object>} The updated lesson data.
 * @throws {Error} If there is an error during the update.
 */
router.put('/:lessionId', isAuthenticated, checkUserPermission, async (req, res) => {
  const { lessionId } = req.params
  const {
    lessionCategoryId,
    name,
    description,
    type,
    content,
    order,
    locationPath,
    uploadedBy,
    notify,
    allowDownload,
    allow_download: legacyAllowDownload
  } = req.body.data
  try {
    // TODO Fetch the lesson by its ID
    const lession = await models.Lession.findByPk(lessionId)
    if (!lession) {
      logError(req, { message: MASSAGE.LESSION_NOT_FOUND })
      return res.status(404).json({ message: MASSAGE.LESSION_NOT_FOUND })
    }

    // TODO Fetch the old and new category lessons
    const oldCategoryLession = await models.CategoryLession.findByPk(lession.lessionCategoryId)
    const oldCategoryLessionId = oldCategoryLession.id

    const newCategoryLession = await models.CategoryLession.findByPk(lessionCategoryId)
    const newCategoryLessionId = newCategoryLession.id

    const oldLocationPath = lession.locationPath
    const normalizedType = (type || '').toUpperCase()
    const normalizedAllowDownload = Boolean(allowDownload ?? legacyAllowDownload)
    const shouldAllowDownload = normalizedType === 'PDF' && normalizedAllowDownload
    lession.lessionCategoryId = lessionCategoryId
    lession.name = name
    lession.description = description
    lession.type = type
    lession.content = content
    lession.locationPath = locationPath
    lession.allowDownload = shouldAllowDownload
    lession.uploadedBy = uploadedBy
    // TODO Check if the new category lesson exists
    const categoryLession = await models.CategoryLession.findByPk(lessionCategoryId)
    if (!categoryLession) {
      return res.status(404).json({ message: MASSAGE.CATEGORY_LESSION_NOT_FOUND })
    }
    const courseId = categoryLession.courseId
    // TODO Check for existing lessons with the same name in the same course
    const existingLession = await models.Lession.findOne({
      where: {
        name,
        id: { [Op.not]: lessionId }
      },
      include: [{
        model: models.CategoryLession,
        where: { courseId },
        attributes: []
      }],
      raw: true
    })
    if (existingLession) {
      if (oldLocationPath !== locationPath) {
        const imagePath = path.resolve(__dirname, '../uploads/lessions', locationPath)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
          console.log('Deleted file:', imagePath)
        }
      }
      return res.status(400).json({ message: MASSAGE.NAME_EXIST })
    }

    // TODO Check for existing lessons with the same location path in the same course
    const existingLocationPath = await models.Lession.findOne({
      where: {
        locationPath,
        id: { [Op.not]: lessionId }
      },
      include: [{
        model: models.CategoryLession,
        where: { courseId },
        attributes: []
      }],
      raw: true
    })
    if (existingLocationPath) {
      if (oldLocationPath !== locationPath) {
        const imagePath = path.resolve(__dirname, '../uploads/lessions', locationPath)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
          console.log('Deleted file:', imagePath)
        }
      }
      return res.status(400).json({ message: MASSAGE.LOCATIONPATH_EXIST })
    }

    // TODO Delete the old file if the location path has changed
    if (oldLocationPath !== locationPath) {
      const imagePath = path.resolve(__dirname, '../uploads/lessions', oldLocationPath)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
        console.log('Deleted file:', imagePath)
      } else {
        console.log('File not found:', imagePath)
      }
    }

    // TODO Update the lesson order if the category has changed
    if (oldCategoryLessionId === newCategoryLessionId) {
      lession.name = name
      lession.description = description
      lession.type = type
      lession.content = content
      lession.locationPath = locationPath
      lession.allowDownload = shouldAllowDownload
      lession.uploadedBy = uploadedBy
      lession.order = order
      await lession.save()

      const completedEnrollments = await models.CourseProgress.findAll({
        where: {
          lessionId
        },
        include: [{
          model: models.Enrollment,
          include: [{
            model: models.User
          }]
        }]
      })

      if (notify && completedEnrollments.length > 0) {
        const notification = await models.Notification.create({
          title: 'Lesson content updated',
          message: `"${lession.name}"`,
          url: `/learning/${courseId}?id=${lession.id}`
        })

        for (const progress of completedEnrollments) {
          await models.NotificationRecipient.create({
            userId: progress.Enrollment.userId,
            notificationId: notification.id,
            status: 0
          })
        }
      }

      logInfo(req, lession)
      return res.json(lession)
    }
    if (oldCategoryLessionId !== newCategoryLessionId) {
      const maxOrderResult = await models.Lession.findOne({
        where: { lessionCategoryId },
        order: [['order', 'DESC']],
        attributes: ['order']
      })
      const maxOrder = maxOrderResult ? maxOrderResult.order : 0
      const newOrder = maxOrder + 1
      lession.order = newOrder
    } else {
      lession.order = order
    }
    await lession.save()
    // TODO Reorder lessons in the old and new categories if the category has changed
    if (oldCategoryLessionId !== newCategoryLessionId) {
      await reorderLessonsInCategory(oldCategoryLessionId)
      await reorderLessonsInCategory(newCategoryLessionId)
    } else {
      await reorderLessonsInCategory(newCategoryLessionId)
    }

    // TODO Update the checkUpDate for the new category lesson
    await models.CategoryLession.update(
      { checkUpDate: new Date() },
      { where: { id: lessionCategoryId } }
    )
    logInfo(req, lession)
    res.json(lession)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Retrieves a list of courses with their IDs and names.
 *
 * @author Hien
 * @route GET /courses
 * @returns {Promise<Array<Object>>} A list of courses with their IDs and names.
 * @throws {Error} If there is an error retrieving the courses.
 */
router.get('/courses', isAuthenticated, async (req, res) => {
  try {
    // TODO Fetch all courses with their IDs and names
    const courses = await models.Course.findAll({
      attributes: ['id', 'name']
    })
    logInfo(req, courses)
    res.json(courses)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Retrieves all category lessons for a specific course.
 *
 * @author Hien
 * @route GET /courses/:courseId/category_lesions
 * @param {string} req.params.courseId - The ID of the course.
 * @returns {Promise<Array<Object>>} A list of category lessons for the specified course.
 * @throws {Error} If there is an error retrieving the category lessons.
 */
router.get('/courses/:courseId/category_lesions', isAuthenticated, async (req, res) => {
  const { courseId } = req.params

  try {
    // TODO Fetch all category lessons for the specified course
    const categoryLesions = await models.CategoryLession.findAll({ where: { courseId } })
    // TODO Check if no category lessons are found
    if (categoryLesions.length === 0) {
      return res.status(404).json({ message: MASSAGE.CATEGORY_LESSION_NOT_FOUND })
    }
    logInfo(req, categoryLesions)
    res.json(categoryLesions)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Retrieves all lessons for a specific category lesson.
 *
 * @author Hien
 * @route GET /category_lesions/:categoryLesionId/lessions
 * @param {string} req.params.categoryLesionId - The ID of the category lesson.
 * @returns {Promise<Array<Object>>} A list of lessons for the specified category lesson.
 * @throws {Error} If there is an error retrieving the lessons.
 */
router.get('/category_lesions/:categoryLesionId/lessions', isAuthenticated, async (req, res) => {
  const { categoryLesionId } = req.params
  try {
    // TODO Fetch all lessons for the specified category lesson
    const lessons = await models.Lession.findAll({ attributes: { exclude: ['allowDownload'] }, where: { lessionCategoryId: categoryLesionId } })
    logInfo(req, lessons)
    res.json(lessons)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Retrieves a lesson by its ID and includes the category lesson name.
 *
 * @author Canh
 * @route GET /:lessionId
 * @param {string} req.params.lessionId - The ID of the lesson.
 * @returns {Promise<Object>} The lesson data with the category lesson name.
 * @throws {Error} If there is an error retrieving the lesson.
 */
router.get('/:lessionId', isAuthenticated, async (req, res) => {
  const { lessionId } = req.params

  try {
    // TODO Fetch all category lessons
    const lessionCate = await models.CategoryLession.findAll()
    // TODO Fetch the lesson by its primary key (ID)
    const lession = await models.Lession.findByPk(lessionId)

    // TODO Construct the response object
    const response = {
      ...lession.toJSON(),
      categoryLessionName: lessionCate?.find((e) => lession.lessionCategoryId === e.id)?.name ?? null
    }
    res.json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Deletes multiple lessons and updates related data.
 *
 * @author Hien
 * @route DELETE /
 * @param {Array<number>} req.body.lessionIds - The IDs of the lessons to be deleted.
 * @returns {Promise<Object>} A success message if the deletion is successful.
 * @throws {Error} If there is an error during the deletion process.
 */
router.delete('/', isAuthenticated, checkUserPermission, async (req, res) => {
  const { lessionIds } = req.body
  // TODO Validate the input to ensure lessionIds is a non-empty array
  if (!Array.isArray(lessionIds) || lessionIds.length === 0) {
    return res.status(400).json({ message: 'Invalid input. lessionIds must be a non-empty array.' })
  }

  // TODO Convert lesson IDs to integers
  const lessionIdsAsIntegers = lessionIds.map(id => parseInt(id, 10))

  try {
    // TODO Fetch lessons to be deleted
    const lessions = await models.Lession.findAll({
      where: { id: lessionIdsAsIntegers }
    })
    // TODO Check if any lessons are found
    if (lessions.length === 0) {
      return res.status(404).json({ message: MASSAGE.LESSION_NOT_FOUND })
    }

    // TODO Delete course progress related to the lessons
    await models.CourseProgress.destroy({ where: { lessionId: lessionIds } })

    // TODO Create patterns to find related notifications
    const lessionIdsPattern = lessionIds.map(id => `%?id=${id}%`)

    // TODO Fetch related notifications
    const relatedNotifications = await models.Notification.findAll({
      where: {
        [Op.or]: lessionIdsPattern.map(pattern => ({
          url: {
            [Op.like]: pattern
          }
        }))
      }
    })

    // TODO Delete related notifications and their recipients
    if (relatedNotifications.length > 0) {
      const notificationIds = relatedNotifications.map(notification => notification.id)
      await models.NotificationRecipient.destroy({ where: { notificationId: notificationIds } })
      await models.Notification.destroy({ where: { id: notificationIds } })
    }

    // TODO Delete the lessons
    await models.Lession.destroy({ where: { id: lessionIds } })

    // TODO Delete lesson files from the filesystem
    lessions.forEach(lession => {
      const imagePath = path.resolve(__dirname, '../uploads/lessions', lession.locationPath)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
        console.log('Deleted file:', imagePath)
      } else {
        console.log('File not found:', imagePath)
      }
    })

    // TODO Get the category ID of the deleted lessons
    const categoryId = lessions[0].lessionCategoryId

    // TODO Reorder lessons in the category
    await reorderLessonsInCategory(categoryId)

    // TODO Get the latest lesson in the category to update the checkUpDate
    const latestLession = await models.Lession.findOne({
      where: { lessionCategoryId: categoryId },
      order: [['createdAt', 'DESC']]
    })

    // TODO Update the checkUpDate for the category lesson
    const newCheckUpDate = latestLession ? latestLession.createdAt : null

    await models.CategoryLession.update(
      { checkUpDate: newCheckUpDate },
      { where: { id: categoryId } }
    )

    // TODO Fetch the category lesson to get the course ID
    const categoryLession = await models.CategoryLession.findByPk(categoryId)
    if (!categoryLession) {
      return res.status(404).json({ message: MASSAGE.CATEGORYLESSION_NOT_FOUND })
    }

    const courseId = categoryLession.courseId
    // TODO Fetch enrollments for the course
    const enrollments = await models.Enrollment.findAll({
      where: { courseId },
      include: [{ model: models.User }]
    })
    // TODO Get the total number of lessons in the course after deletion
    const totalLessions = await models.Lession.count({
      include: [{
        model: models.CategoryLession,
        where: { courseId },
        attributes: []
      }]
    })

    // TODO Update progress for each enrollment
    for (const enrollment of enrollments) {
      // TODO Calculate the total number of completed lessons for this student
      const completedLessionsCount = await models.CourseProgress.count({
        where: {
          enrollmentId: enrollment.id
        }
      })
      // TODO Update progress based on the actual number of completed lessons
      const newProgress = totalLessions > 0 ? completedLessionsCount / totalLessions : 0
      if (newProgress === 1) {
        await models.Enrollment.update(
          { progress: newProgress, status: 1, completedDate: new Date() },
          { where: { id: enrollment.id } }
        )
      } else {
        await models.Enrollment.update(
          { progress: newProgress, status: 0, completedDate: null },
          { where: { id: enrollment.id } }
        )
      }
    }

    logInfo(req, { message: MASSAGE.DELETE_SUCCESS })
    res.json({ message: MASSAGE.DELETE_SUCCESS })
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Creates a new lesson and updates related data.
 *
 * @author Hien
 * @route POST /
 * @param {Object} req.body.data - The request body containing lesson details.
 * @param {number} req.body.data.lessionCategoryId - The ID of the category lesson.
 * @param {string} req.body.data.name - The name of the lesson.
 * @param {string} req.body.data.description - The description of the lesson.
 * @param {string} req.body.data.type - The type of the lesson.
 * @param {string} req.body.data.content - The content of the lesson.
 * @param {string} req.body.data.locationPath - The file path of the lesson.
 * @param {string} req.body.data.uploadedBy - The user who uploaded the lesson.
 * @returns {Promise<Object>} The created lesson data.
 * @throws {Error} If there is an error during the creation process.
 */
router.post('/', isAuthenticated, checkUserPermission, async (req, res) => {
  const {
    lessionCategoryId,
    name,
    description,
    type,
    content,
    locationPath,
    uploadedBy,
    notify,
    allowDownload,
    allow_download: legacyAllowDownload
  } = req.body.data

  const transaction = await sequelize.transaction()

  try {
    // TODO Fetch the category lesson by its ID
    const categoryLession = await models.CategoryLession.findByPk(lessionCategoryId, { transaction })
    if (!categoryLession) {
      await transaction.rollback()
      return res.status(404).json({ message: MASSAGE.CATEGORYLESSION_NOT_FOUND })
    }
    const courseId = categoryLession.courseId
    // TODO Check if a lesson with the same name already exists in the course
    const existingLession = await models.Lession.findOne({
      where: { name },
      include: [{
        model: models.CategoryLession,
        where: { courseId },
        attributes: []
      }],
      transaction
    })

    if (existingLession) {
      const imagePath = path.resolve(__dirname, '../uploads/lessions', locationPath)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
        console.log('Deleted file:', imagePath)
      }
      await transaction.rollback()
      return res.status(400).json({ message: MASSAGE.NAME_EXIST })
    }

    // TODO Check if a lesson with the same location path already exists in the course
    const existingLocationPath = await models.Lession.findOne({
      where: { locationPath },
      include: [{
        model: models.CategoryLession,
        where: { courseId },
        attributes: []
      }],
      transaction
    })

    if (existingLocationPath) {
      const imagePath = path.resolve(__dirname, '../uploads/lessions', locationPath)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
        console.log('Deleted file:', imagePath)
      }
      await transaction.rollback()
      return res.status(400).json({ message: MASSAGE.LOCATIONPATH_EXIST })
    }

    // TODO Get the maximum order value for lessons in the category
    const maxOrderResult = await models.Lession.findOne({
      where: { lessionCategoryId },
      order: [['order', 'DESC']],
      attributes: ['order'],
      transaction
    })
    const maxOrder = maxOrderResult ? maxOrderResult.order : 0
    const newOrder = maxOrder + 1

    // TODO Create the new lesson
    const normalizedType = (type || '').toUpperCase()
    const normalizedAllowDownload = Boolean(allowDownload ?? legacyAllowDownload)
    const shouldAllowDownload = normalizedType === 'PDF' && normalizedAllowDownload

    const lession = await models.Lession.create({
      lessionCategoryId,
      name,
      description,
      type,
      content,
      order: newOrder,
      locationPath,
      allowDownload: shouldAllowDownload,
      uploadedBy
    }, { transaction })

    // TODO Reorder lessons in the category
    await reorderLessonsInCategory(lessionCategoryId, transaction)

    // TODO Update the checkUpDate for the category lesson
    await models.CategoryLession.update(
      { checkUpDate: new Date() },
      { where: { id: lessionCategoryId }, transaction }
    )

    // TODO Fetch enrollments for the course
    const enrollments = await models.Enrollment.findAll({
      where: { courseId },
      include: [{
        model: models.User
      }],
      transaction
    })

    // TODO Calculate the total number of lessons in the entire course after adding the new one
    const totalLessons = await models.Lession.count({
      include: [{
        model: models.CategoryLession,
        where: { courseId },
        attributes: []
      }],
      transaction
    })

    // Update progress and status for all enrollments
    for (const enrollment of enrollments) {
      // Calculate the actual number of completed lessons for this student
      const completedLessonsCount = await models.CourseProgress.count({
        where: {
          enrollmentId: enrollment.id
        },
        transaction
      })

      // TODO Update the student's progress with the new total number of lessons
      const newProgress = completedLessonsCount / totalLessons

      // TODO Update progress and status
      await models.Enrollment.update(
        { progress: newProgress, status: 0, completedDate: null },
        { where: { id: enrollment.id }, transaction }
      )
    }

    if (notify && enrollments.length > 0) {
      // Create a notification for the new lesson
      const notification = await models.Notification.create({
        title: 'New Lesson',
        message: `"${lession.name}"`,
        url: `/learning/${courseId}?id=${lession.id}`
      }, { transaction })

      for (const enrollment of enrollments) {
        // Create notification recipients for each enrolled user
        await models.NotificationRecipient.create({
          userId: enrollment.userId,
          notificationId: notification.id,
          status: 0
        }, { transaction })
      }
    }

    await transaction.commit()

    logInfo(req, lession)
    res.json(lession)
  } catch (err) {
    await transaction.rollback()
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

/**
 * Retrieves the first incomplete lesson for a specific user in a specific course.
 *
 * @author Hien
 * @route GET /getFirstIncompleteLessionCourse/:userId/:courseId
 * @param {string} req.params.userId - The ID of the user.
 * @param {string} req.params.courseId - The ID of the course.
 * @returns {Promise<Object>} The first incomplete lesson or null if all lessons are complete.
 * @throws {Error} If there is an error retrieving the lesson.
 */
router.get('/getFirstIncompleteLessionCourse/:userId/:courseId', isAuthenticated, async (req, res) => {
  const { userId, courseId } = req.params

  try {
    // TODO Fetch enrollments for the user in the specified course
    const enrollments = await models.Enrollment.findAll({
      where: { userId, courseId },
      attributes: ['id']
    })

    // TODO Check if no enrollments are found
    if (enrollments.length === 0) {
      return res.status(200).json({ lession: null })
    }

    // TODO Extract enrollment IDs
    const enrollmentIds = enrollments.map(enrollment => enrollment.id)
    // TODO Fetch lessons and their completion status
    const lessons = await sequelize.query(
      `SELECT l.id, l.name, l.\`order\`, cl.\`order\` AS category_order,
        (SELECT COUNT(*) FROM course_progress cp
          WHERE cp.lessionId = l.id AND cp.enrollmentId IN (:enrollmentIds)) AS completion_count
       FROM lessions l
       JOIN category_lession cl ON l.lessionCategoryId = cl.id
       WHERE cl.courseId = :courseId
       ORDER BY cl.\`order\` ASC, l.\`order\` ASC`,
      {
        replacements: { enrollmentIds, courseId },
        type: sequelize.QueryTypes.SELECT
      }
    )
    // TODO Find the first incomplete lesson
    const firstIncompleteLession = lessons.find(lesson => lesson.completion_count === 0)
    if (firstIncompleteLession) {
      res.status(200).json({ lession: firstIncompleteLession })
    } else {
      res.status(200).json({ lession: null })
    }
  } catch (error) {
    logError(req, error)
    console.error('Failed to fetch first incomplete lession:', error)
    res.status(500).json({ message: MASSAGE.FAILED_TO_FIRST_LESSION })
  }
})

/**
 * Checks for updates in the course categories for a specific user.
 *
 * @author Hien
 * @route GET /checkUpdates/:userId/:courseId
 * @param {string} req.params.userId - The ID of the user.
 * @param {string} req.params.courseId - The ID of the course.
 * @returns {Promise<Object>} An object containing the updated categories.
 * @throws {Error} If there is an error checking for updates.
 */
router.get('/checkUpdates/:userId/:courseId', isAuthenticated, async (req, res) => {
  const { userId, courseId } = req.params
  try {
    // TODO Find the enrollment for the user in the specified course
    const enrollment = await models.Enrollment.findOne({
      where: { userId, courseId },
      include: [{
        model: models.Course,
        where: { id: courseId },
        include: [{
          model: models.CategoryLession
        }]
      }]
    })

    // TODO If no enrollment is found, return an empty updates array
    if (!enrollment) {
      return res.status(200).json({ updates: [] })
    }

    const updatedCategories = []
    const categories = enrollment.Course.CategoryLessions
    for (const category of categories) {
      // TODO Find all lessons in the current category
      const allLessons = await models.Lession.findAll({
        where: { lessionCategoryId: category.id }
      })

      // TODO Count the number of completed lessons for the user in the current category
      const completedLessonsCount = await models.CourseProgress.count({
        where: {
          enrollmentId: enrollment.id,
          lessionId: {
            [Op.in]: allLessons.map(lesson => lesson.id)
          }
        }
      })

      // TODO Skip the category if all lessons are completed
      if (completedLessonsCount === allLessons.length) {
        continue
      }

      // TODO Find the user's last progress in the current category
      const userLastProgress = await models.CourseProgress.findOne({
        where: {
          enrollmentId: enrollment.id,
          lessionId: {
            [Op.in]: allLessons.map(lesson => lesson.id)
          }
        },
        order: [['updatedAt', 'DESC']]
      })

      // TODO Check if the category has been updated since the user's last progress
      if (userLastProgress && category.checkUpDate !== null && category.checkUpDate > userLastProgress.updatedAt) {
        updatedCategories.push({
          id: category.id,
          name: category.name
        })
      }
    }

    res.status(200).json({ updates: updatedCategories })
  } catch (error) {
    logError(req, error)
    console.error('Failed to check updates:', error)
    res.status(500).json({ message: MASSAGE.FAILED_TO_CHECK_UPDATES })
  }
})

/**
 * Configures the storage settings for file uploads using multer.
 *
 * @author Hien
 * @param {Object} req - The request object.
 * @param {Object} file - The file object.
 * @param {Function} cb - The callback function.
 * @returns {void}
 */
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../temp_chunks')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

// Configure multer with the storage settings and file size limit
const uploadChunk = multer({
  storage: chunkStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
})

/**
 * Handles chunked file upload and responds with the file name if successful.
 *
 * @route POST /chunk-upload
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} A success message with the file name if the upload is successful.
 * @throws {Error} If there is an error during the file upload process.
 */
router.post('/chunk-upload', isAuthenticated, checkUserPermission, (req, res) => {
  uploadChunk.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File is too large. Maximum size is 10MB.' })
      }
      console.error('Multer Error:', err)
      return res.status(500).json({ message: err.message })
    }

    const { fileName, chunkIndex, totalChunks, uniqueId } = req.body
    const tempDir = path.join(__dirname, '../temp_chunks')
    const chunkPath = path.join(tempDir, `${uniqueId}-${fileName}-${chunkIndex}`)

    try {
      if (!fs.existsSync(req.file.path)) {
        console.error('Uploaded file does not exist:', req.file.path)
        return res.status(500).json({ message: 'Uploaded file does not exist' })
      }

      fs.renameSync(req.file.path, chunkPath)

      if (+chunkIndex === +totalChunks - 1) {
        const newFileName = fileName.split('.')[0] + '_' + Date.now() + path.extname(fileName)
        const finalPath = path.join(__dirname, '../uploads/lessions', newFileName)
        const writeStream = fs.createWriteStream(finalPath)

        writeStream.on('error', () => res.status(500).json({ message: 'Error merging chunks' }))
        writeStream.on('finish', () => {
          res.json({ success: true, data: { file: newFileName } })
        })

        for (let i = 0; i < totalChunks; i++) {
          const chunkFilePath = path.join(tempDir, `${uniqueId}-${fileName}-${i}`)
          if (fs.existsSync(chunkFilePath)) {
            const data = fs.readFileSync(chunkFilePath)
            writeStream.write(data)
            fs.unlinkSync(chunkFilePath)
          } else {
            console.error('Chunk file does not exist:', chunkFilePath)
            return res.status(500).json({ message: 'Chunk file does not exist' })
          }
        }
        writeStream.end()
      } else {
        res.json({ success: true })
      }
    } catch (error) {
      console.error('Error processing chunk:', error)
      return res.status(500).json({ message: 'Error processing chunk' })
    }
  })
})

/**
 * Ensures the directory for lesson uploads exists, creating it if necessary.
 *
 * @author Hien
 * @file lession.js
 */

// Define the directory path for lesson uploads
const dir = path.resolve(__dirname, '../uploads/lessions')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
  console.log('Directory created:', dir)
} else {
  console.log('Directory already exists:', dir)
}

module.exports = router
