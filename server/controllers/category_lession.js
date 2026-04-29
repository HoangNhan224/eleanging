const express = require('express')
const { models } = require('../models')
const router = express.Router()
require('sequelize')
const { Op } = require('sequelize')
const { infoLogger, errorLogger } = require('../logs/logger')
function logInfo (req, response) {
  // Extract the request data:
  // Prefer req.body.data if it exists; otherwise, check req.params or req.query
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)

  // Log the information:
  // Use infoLogger to log details like the accessed endpoint, HTTP method, and request/response content
  infoLogger.info({
    message: `Accessed ${req.path}`, // Log the endpoint that was accessed
    method: req.method, // Log the HTTP method used (GET, POST, etc.)
    endpoint: req.path, // The path of the endpoint being accessed
    request, // The request data sent by the client
    response // The response data to be sent back to the client
  })
}
function logError (req, error) {
  // Extract the request data:
  // Prefer req.body.data if it exists; otherwise, check req.params or req.query
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)

  // Log the error information:
  // Use errorLogger to log details like the endpoint, HTTP method, and request data along with the error message
  errorLogger.error({
    message: `Error ${req.path}`, // Log the path where the error occurred
    method: req.method, // Log the HTTP method used (GET, POST, etc.)
    endpoint: req.path, // The path of the endpoint where the error occurred
    request, // The request data sent by the client
    error // The error object or message
  })
}
/**
 * Deletes a category lesson.
 * This endpoint deletes a category lesson from the database using the specified lesson ID. If there is a foreign key
 * constraint error, it will first delete related entries in the `Lession` table and then proceed to delete the
 * category lesson.
 *
 * @route DELETE /:id
 * @param {string} req.params.id - The ID of the category lesson to delete.
 * @returns {Promise<Object>} A message indicating whether the deletion was successful or if the category lesson was not found.
 * @throws {404} If the category lesson is not found.
 * @throws {500} If there is an internal server error or a foreign key constraint error.
 */
const MESSAGES = {
  CATEGORY_LESSION_DELETED: 'Category lesson has been successfully deleted.',
  CATEGORY_LESSION_NOT_FOUND: 'Category lesson not found.',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  FOREIGN_KEY_CONSTRAINT_ERROR: 'Cannot delete category lesson due to related entries. Related entries in Lession have been removed, and the category lesson has been deleted.'
}

router.delete('/:id', async (req, res) => {
  const lessionId = req.params.id // Ensure ID is defined from params

  try {
    // Attempt to delete the CategoryLession
    const deletedCategoryLession = await models.CategoryLession.destroy({
      where: { id: lessionId }
    })

    if (deletedCategoryLession) {
      // If deletion is successful
      logInfo(req, MESSAGES.CATEGORY_LESSION_DELETED)
      res.json({ message: MESSAGES.CATEGORY_LESSION_DELETED })
    } else {
      // If CategoryLession is not found
      logError(req, MESSAGES.CATEGORY_LESSION_NOT_FOUND)
      res.status(404).json({ error: MESSAGES.CATEGORY_LESSION_NOT_FOUND })
    }
  } catch (error) {
    // Handle foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      try {
        // Find and delete related entries in the Lession table
        await models.Lession.destroy({
          where: { categoryLessionId: lessionId } // Assuming categoryLessionId is the foreign key in Lession
        })

        // After deleting related Lession entries, attempt to delete CategoryLession again
        const deletedCategoryLessionAfter = await models.CategoryLession.destroy({
          where: { id: lessionId }
        })

        if (deletedCategoryLessionAfter) {
          logInfo(req, MESSAGES.CATEGORY_LESSION_DELETED)
          res.json({ message: MESSAGES.CATEGORY_LESSION_DELETED })
        } else {
          logError(req, MESSAGES.CATEGORY_LESSION_NOT_FOUND)
          res.status(404).json({ error: MESSAGES.CATEGORY_LESSION_NOT_FOUND })
        }
      } catch (err) {
        // Log and return internal server error if unable to delete related records
        logError(req, MESSAGES.INTERNAL_SERVER_ERROR)
        res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR })
      }
    } else {
      // Log and return internal server error for any other errors
      logError(req, MESSAGES.INTERNAL_SERVER_ERROR)
      res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR })
    }
  }
})

/**
 * Retrieves a list of category courses.
 * This endpoint fetches all category courses from the database, including each course's ID, name, creation date, and
 * last update date, sorted by ID in ascending order.
 *
 * @route GET /categorylession/courses/
 * @returns {Promise<Object>} A JSON object containing an array of category courses.
 * @throws {500} If there is an internal server error while retrieving data.
 */

router.get('/courses/', async (req, res) => {
  try {
    // Retrieve the list of category courses from the database
    const categoryCourses = await models.Course.findAll({
      attributes: ['id', 'name', 'createdAt', 'updatedAt'], // Select relevant fields
      order: [['id', 'ASC']] // Sort by ID in ascending order
    })

    // Return the result in a JSON response
    res.json({
      data: categoryCourses
    })
  } catch (error) {
    // Log the internal server error and return a 500 status with an error message
    MESSAGES3.error(`${MESSAGES2.INTERNAL_SERVER_ERROR}: ${error.message}`)
    res.status(500).json({ error: MESSAGES2.INTERNAL_SERVER_ERROR })
  }
})

const MESSAGES2 = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error'
}
/**
 * Fetches a list of category lessons.
 * Retrieves category lessons from the database and returns them in descending order of ID.
 *
 * @author Quoc
 * @route GET /categorylession/category_lessions/:courseId
 * @returns {Promise<Object>} An object containing the list of category lessons.
 * @throws {500} If there is an internal server error while fetching the data.
 */
router.get('/category_lessions/:courseId', async (req, res) => {
  const { courseId } = req.params // Extract courseId from the URL parameters

  try {
    // Retrieve the list of category lessons filtered by courseId and include the Course name
    const categoryLessons = await models.CategoryLession.findAll({
      attributes: ['id', 'name', 'order', 'checkUpDate', 'createdAt', 'updatedAt', 'courseId'], // Select relevant fields from CategoryLession
      where: { courseId }, // Filter by courseId
      order: [['order', 'ASC']], // Sort by 'order' in ascending order
      include: [{
        model: models.Course, // Include the related Course model
        attributes: ['name'] // Only select the name from the Course model
      }]
    })

    // Format the result to include the course name instead of courseId
    const formattedLessons = categoryLessons.map(lesson => ({
      id: lesson.id,
      name: lesson.name,
      order: lesson.order,
      checkUpDate: lesson.checkUpDate,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      courseName: lesson.Course ? lesson.Course.name : null // Replace courseId with course name
    }))

    // Return the result in a JSON response
    res.json({
      data: formattedLessons
    })
  } catch (error) {
    // Handle any errors by returning a 500 status with an error message
    res.status(500).json({ error: MESSAGES2.INTERNAL_SERVER_ERROR })
  }
})

/**
 * Fetches a category lesson by its ID.
 * Retrieves a specific category lesson from the database by its ID.
 *
 * @author Quoc
 * @route GET /categorylession/:id
 * @param {Number} id - The ID of the category lesson to retrieve.
 * @returns {Promise<Object>} An object containing the category lesson details.
 * @throws {404} If the category lesson is not found.
 * @throws {500} If there is an internal server error while fetching the data.
 */
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id

    // Retrieve the category lesson by its ID
    const categoryLession = await models.CategoryLession.findByPk(categoryId, {
      attributes: ['id', 'courseId', 'name', 'order', 'checkUpDate', 'createdAt', 'updatedAt'] // Select relevant fields
    })

    // If the category lesson is not found, return a 404 response
    if (!categoryLession) {
      return res.status(404).json({ error: 'Category lesson not found' })
    }

    // Return the category lesson details in the response
    res.json({
      data: categoryLession
    })
  } catch (error) {
    // Handle any errors by returning a 500 status with an error message
    res.status(500).json({ error: 'Internal server error' })
  }
})

const MESSAGES3 = {
  CATEGORY_LESSION_DELETED: 'Category Lession deleted successfully',
  CATEGORY_LESSION_NOT_FOUND: 'Category Lession not found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  FOREIGN_KEY_CONSTRAINT_ERROR: 'Cannot delete Category Lession because it is referenced by other Lessions or tables'
}
const MESSAGES1 = {
  COURSE_ID_REQUIRED: 'Course ID is required.',
  NAME_REQUIRED: 'Name is required.',
  NAME_DUPLICATE: 'Name already exists. Please choose a different name.',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred. Please try again later.'
}

/**
 * Creates a new category lesson.
 * This endpoint allows the addition of a new category lesson to the database. It ensures that the `name` is unique
 * for each `courseId` and sets an appropriate `order` value based on existing lessons in the course.
 *
 * @author Quoc
 * @route POST /categorylession
 * @param {Object} req.body - The category lesson data.
 * @param {string} req.body.courseId - The ID of the course this category lesson belongs to.
 * @param {string} req.body.name - The name of the category lesson (required and unique within the course).
 * @param {number} [req.body.order] - Optional order; if not provided, the order will be assigned automatically.
 * @returns {Promise<Object>} A success message and the newly created category lesson details.
 * @throws {400} If `courseId` or `name` is missing, or if `name` is not unique within the course.
 * @throws {500} If there is an internal server error while creating the data.
 */

router.post('/', async (req, res) => {
  try {
    const { courseId, name, order } = req.body

    // Check for required courseId and respond with specific error if missing
    if (!courseId) {
      console.error(MESSAGES1.COURSE_ID_REQUIRED) // Log specific error
      return res.status(400).json({ error: MESSAGES1.COURSE_ID_REQUIRED })
    }

    // Check for required name and respond with specific error if missing
    if (!name) {
      console.error(MESSAGES1.NAME_REQUIRED) // Log specific error
      return res.status(400).json({ error: MESSAGES1.NAME_REQUIRED })
    }

    // Ensure the name is unique within the specified courseId
    const existingCategoryLesson = await models.CategoryLession.findOne({ where: { name } })
    if (existingCategoryLesson) {
      console.error(MESSAGES1.NAME_DUPLICATE) // Log specific error
      return res.status(400).json({ error: MESSAGES1.NAME_DUPLICATE })
    }

    // Retrieve the maximum order value for the current courseId to set a proper order
    const maxOrderCategoryLesson = await models.CategoryLession.findOne({
      where: { courseId },
      order: [['order', 'DESC']]
    })

    let newOrder = order

    if (maxOrderCategoryLesson) {
      if (order === undefined || order <= maxOrderCategoryLesson.order) {
        newOrder = maxOrderCategoryLesson.order + 1 // Increment order if undefined or less than max
      }
    } else if (order === undefined) {
      newOrder = 1 // Start order from 1 if no lessons exist
    }

    // Create the new category lesson with calculated order and the current date for checkUpDate
    const newCategoryLesson = await models.CategoryLession.create({
      courseId,
      name,
      order: newOrder,
      checkUpDate: new Date()
    })

    // Send success response with the new category lesson details
    res.status(201).json({
      message: 'Category lesson created successfully',
      data: newCategoryLesson
    })
  } catch (error) {
    // Log the full error and stack trace for debugging
    console.error('Error creating category lesson:', error)

    // Send a 500 response with the error message
    res.status(500).json({ error: error.message })
  }
})
// có sửa courseID

// /**
//  * Updates an existing category lesson.
//  * This endpoint allows for updating the details of a category lesson by its ID. It ensures that the `name` remains unique
//  * within the course, and adjusts the `order` field accordingly when the course is changed or a new order is specified.
//  *
//  * @author Quoc
//  * @route PUT /categorylession/:id
//  * @param {string} id - The ID of the category lesson to update (from the URL params).
//  * @param {Object} req.body - The category lesson data to update.
//  * @param {string} req.body.courseId - The ID of the course this category lesson should belong to.
//  * @param {string} req.body.name - The new name of the category lesson (required and unique within the course).
//  * @param {number} [req.body.order] - Optional new order; if not provided, the order will remain unchanged unless the course is changed.
//  * @returns {Promise<Object>} A success message and the updated category lesson details.
//  * @throws {400} If `courseId` or `name` is missing, or if `name` is not unique within the course.
//  * @throws {404} If the category lesson with the provided ID is not found.
//  * @throws {500} If there is an internal server error while updating the data.
//  */

// router.put('/:id', async (req, res) => {
//   try {
//     const { id } = req.params // Get the category lesson ID from params
//     const { courseId, name, order } = req.body // Get fields to update from the body

//     // Check if courseId is provided
//     if (!courseId) {
//       MESSAGES3.error(MESSAGES1.COURSE_ID_REQUIRED)
//       return res.status(400).json({ error: MESSAGES1.COURSE_ID_REQUIRED })
//     }

//     // Check if name is provided
//     if (!name) {
//       MESSAGES3.error(MESSAGES1.NAME_REQUIRED)
//       return res.status(400).json({ error: MESSAGES1.NAME_REQUIRED })
//     }

//     // Find existing category lesson by ID
//     const existingCategoryLesson = await models.CategoryLession.findByPk(id)
//     if (!existingCategoryLesson) {
//       return res.status(404).json({ error: 'Category lesson not found' })
//     }

//     // Check for duplicate name (excluding the current lesson)
//     const duplicateCategoryLesson = await models.CategoryLession.findOne({
//       where: { name, id: { [Op.ne]: id } }
//     })
//     if (duplicateCategoryLesson) {
//       MESSAGES3.error(MESSAGES1.NAME_DUPLICATE)
//       return res.status(400).json({ error: MESSAGES1.NAME_DUPLICATE })
//     }

//     let newOrder = order
//     const oldCourseId = existingCategoryLesson.courseId // Store old courseId

//     // If courseId is changing, update order
//     if (courseId !== oldCourseId) {
//       // Adjust the order for lessons in the old course
//       await models.CategoryLession.increment(
//         { order: -1 }, // Decrease order of lessons in the old course
//         { where: { courseId: oldCourseId, order: { [Op.gt]: existingCategoryLesson.order } } }
//       )

//       // Determine the new order for the new courseId
//       const maxOrderCategoryLesson = await models.CategoryLession.findOne({
//         where: { courseId },
//         order: [['order', 'DESC']]
//       })

//       if (maxOrderCategoryLesson) {
//         newOrder = maxOrderCategoryLesson.order + 1
//       } else {
//         newOrder = 1 // Start order from 1 if no lessons exist
//       }
//     } else if (order === undefined) {
//       // If courseId hasn't changed and order isn't provided, keep the current order
//       newOrder = existingCategoryLesson.order
//     }

//     // Update the category lesson with new data
//     existingCategoryLesson.courseId = courseId
//     existingCategoryLesson.name = name
//     existingCategoryLesson.order = newOrder
//     existingCategoryLesson.checkUpDate = new Date()

//     // Save the updated category lesson
//     await existingCategoryLesson.save()

//     // Return success message
//     res.status(200).json({
//       message: 'Category lesson updated successfully',
//       data: existingCategoryLesson
//     })
//   } catch (error) {
//     // Log the error and return a 500 status code
//     MESSAGES3.error(`${MESSAGES1.INTERNAL_SERVER_ERROR}: ${error.message}`)
//     res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR })
//   }
// })
/**
 * Updates the name of an existing category lesson.
 * This endpoint allows updating the name of a category lesson by its ID. It ensures that the `name` remains unique within the same course.
 *
 * @route PUT /categorylession/:id
 * @param {string} id - The ID of the category lesson to update (from the URL params).
 * @param {Object} req.body - The category lesson data to update.
 * @param {string} req.body.name - The new name of the category lesson (required and unique within the course).
 * @returns {Promise<Object>} A success message and the updated category lesson details.
 * @throws {400} If `name` is missing or not unique within the course.
 * @throws {404} If the category lesson with the provided ID is not found.
 * @throws {500} If there is an internal server error while updating the data.
 */

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params // Get the category lesson ID from params
    const { name } = req.body // Get name to update from the body

    // Check if name is provided
    if (!name) {
      MESSAGES3.error(MESSAGES1.NAME_REQUIRED)
      return res.status(400).json({ error: MESSAGES1.NAME_REQUIRED })
    }

    // Find existing category lesson by ID
    const existingCategoryLesson = await models.CategoryLession.findByPk(id)
    if (!existingCategoryLesson) {
      return res.status(404).json({ error: 'Category lesson not found' })
    }

    // Check for duplicate name within the same course
    const duplicateCategoryLesson = await models.CategoryLession.findOne({
      where: {
        name,
        courseId: existingCategoryLesson.courseId, // Ensure uniqueness within the same course
        id: { [Op.ne]: id }
      }
    })
    if (duplicateCategoryLesson) {
      MESSAGES3.error(MESSAGES1.NAME_DUPLICATE)
      return res.status(400).json({ error: MESSAGES1.NAME_DUPLICATE })
    }

    // Update the category lesson name
    existingCategoryLesson.name = name
    existingCategoryLesson.checkUpDate = new Date()

    // Save the updated category lesson
    await existingCategoryLesson.save()

    // Return success message
    res.status(200).json({
      message: 'Category lesson updated successfully',
      data: existingCategoryLesson
    })
  } catch (error) {
    // Log the error and return a 500 status code
    MESSAGES3.error(`${MESSAGES1.INTERNAL_SERVER_ERROR}: ${error.message}`)
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR })
  }
})

module.exports = router
