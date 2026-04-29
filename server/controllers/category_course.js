const express = require('express')
const { models } = require('../models')
const router = express.Router()
require('sequelize')
const { infoLogger, errorLogger } = require('../logs/logger')
/**
 * Logs information about the request and response for debugging or auditing purposes.
 * It captures the accessed endpoint, HTTP method, and relevant request and response data.
 *
 * @author Quoc
 * @param {Object} req - The HTTP request object, containing information about the client's request.
 * @param {Object} response - The response data to be logged.
 */
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

/**
 * Logs error information for debugging or auditing purposes.
 * It captures the error details, request data, and the endpoint where the error occurred.
 *
 * @author Quoc
 * @param {Object} req - The HTTP request object, containing information about the client's request.
 * @param {Object} error - The error object or message to be logged.
 */
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

// API để xem danh sách các category_course và thực hiện phân trang
const MESSAGES1 = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error'
}
/**
 * Fetches a list of category courses.
 * Retrieves category courses from the database and returns them in descending order of ID.
 *
 * @author Quoc
 * @route GET /categorycourse
 * @returns {Promise<Object>} An object containing the list of category courses.
 * @throws {500} If there is an internal server error while fetching the data.
 */
router.get('/', async (req, res) => {
  try {
    // Retrieve the list of category courses from the database
    const categoryCourses = await models.CategoryCourse.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt'], // Select relevant fields
      order: [['id', 'DESC']] // Sort by ID in descending order
    })

    // Return the result in a JSON response
    res.json({
      data: categoryCourses
    })
  } catch (error) {
    // Handle any errors by returning a 500 status with an error message
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR })
  }
})

const MESSAGES = {
  CATEGORY_COURSE_DELETED: 'Category Course deleted successfully',
  CATEGORY_COURSE_NOT_FOUND: 'Category Course not found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  FOREIGN_KEY_CONSTRAINT_ERROR: 'Cannot delete category_course because it is referenced by other tables'
}

/**
 * Deletes a category course based on the provided ID.
 * If the category course is referenced elsewhere (foreign key constraint), returns a conflict error.
 *
 * @author Quoc
 * @route DELETE /categorycourse/:id
 * @param {string} req.params.id - The ID of the category course to delete.
 * @returns {Promise<Object>} A success message if the category course is deleted, or an error message if not found or constrained by foreign key.
 * @throws {404} If the category course is not found.
 * @throws {409} If the category course is referenced by a foreign key constraint.
 * @throws {500} If an internal server error occurs.
 */
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id

    // Attempt to delete the category course from the database
    const deletedCategoryCourse = await models.CategoryCourse.destroy({
      where: {
        id: categoryId
      }
    })

    if (deletedCategoryCourse) {
      // Log the successful deletion and respond with a success message
      logInfo(req, deletedCategoryCourse)
      res.json({ message: MESSAGES.CATEGORY_COURSE_DELETED })
    } else {
      // If the category course is not found, log the error and return a 404 status
      logError(req, MESSAGES.CATEGORY_COURSE_NOT_FOUND)
      res.status(404).json({ error: MESSAGES.CATEGORY_COURSE_NOT_FOUND })
    }
  } catch (error) {
    // Handle foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const categoryCourseId = req.params.id
      const categoryCourse = await models.CategoryCourse.findOne({ where: { id: categoryCourseId } })

      // Log the error and respond with a conflict status including the category course name
      logInfo(req, error)
      res.status(409).json({ error: MESSAGES.FOREIGN_KEY_CONSTRAINT_ERROR, categoryCourseName: categoryCourse ? categoryCourse.name : null })
    } else {
      // Log and respond with a 500 status for other errors
      logError(req, MESSAGES.INTERNAL_SERVER_ERROR)
      res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR })
    }
  }
})

const MESSAGES2 = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  CATEGORY_COURSE_EXISTS: 'Category Course with this name already exists.',
  INVALID_INPUT: 'Name and description are required.'
}
/**
 * Creates a new category course with the provided name and description.
 * If the category course already exists, returns a conflict error.
 *
 * @author Quoc
 * @route POST /categorycourse/
 * @param {string} req.body.name - The name of the new category course.
 * @param {string} req.body.description - The description of the new category course.
 * @returns {Promise<Object>} The newly created category course object, or an error message if validation fails or a conflict occurs.
 * @throws {400} If the name or description is invalid (empty or missing).
 * @throws {409} If a category course with the same name already exists.
 * @throws {500} If an internal server error occurs.
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body

    // Check if name and description are provided and valid
    if (!name.trim()) {
      logError(req, MESSAGES2.INVALID_NAME)
      return res.status(400).json({ error: MESSAGES2.INVALID_NAME })
    }
    if (!description.trim()) {
      return res.status(400).json({ error: MESSAGES2.INVALID_DESCRIPTION })
    }

    // Check if the category course with the same name already exists
    const existingCategoryCourse = await models.CategoryCourse.findOne({ where: { name } })
    if (existingCategoryCourse) {
      return res.status(409).json({ error: MESSAGES2.CATEGORY_COURSE_EXISTS })
    }

    // Create a new category course in the database
    const newCategoryCourse = await models.CategoryCourse.create({
      name,
      description
    })

    // Log and return the newly created category course
    logInfo(req, newCategoryCourse)
    res.status(201).json(newCategoryCourse)
  } catch (error) {
    console.error('Error:', error)
    logError(req, error) // Log the error if unable to add the category course
    res.status(500).json({ error: MESSAGES2.INTERNAL_SERVER_ERROR })
  }
})

const MESSAGES3 = {
  CATEGORY_COURSE_NOT_FOUND: 'Category Course not found.',
  INVALID_INPUT: 'Name and description are required.',
  CATEGORY_COURSE_EXISTS: 'Category Course with this name already exists.',
  CATEGORY_COURSE_UPDATED: 'Category Course updated successfully.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error.'
}
/**
 * Updates an existing category course by its ID.
 * If the category course does not exist, returns a not found error.
 *
 * @author Quoc
 * @route PUT /categorycourse/:id
 * @param {string} req.params.id - The ID of the category course to update.
 * @param {string} req.body.name - The new name for the category course.
 * @param {string} req.body.description - The new description for the category course.
 * @returns {Promise<Object>} The updated category course object, or an error message if the course is not found or validation fails.
 * @throws {400} If the name or description is invalid (empty or missing).
 * @throws {404} If the category course with the given ID is not found.
 * @throws {500} If an internal server error occurs.
 */
router.put('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id
    const { name, description } = req.body

    // Check if the category course exists
    const categoryCourse = await models.CategoryCourse.findByPk(categoryId)
    if (!categoryCourse) {
      return res.status(404).json({ error: MESSAGES3.CATEGORY_COURSE_NOT_FOUND })
    }

    // Validate that name and description are not empty
    if (!name.trim() || !description.trim()) {
      logError(req, MESSAGES3.INVALID_INPUT)
      return res.status(400).json({ error: MESSAGES3.INVALID_INPUT })
    }

    // Update the category course details
    await categoryCourse.update({ name, description })
    logInfo(req, categoryCourse)

    // Return success message and updated category course object
    res.json({ message: MESSAGES3.CATEGORY_COURSE_UPDATED, categoryCourse })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: MESSAGES3.INTERNAL_SERVER_ERROR })
  }
})

const MESSAGES5 = {
  CategoryCourse_NOT_FOUND: 'CategoryCourse not found.',
  FAILED_TO_FETCH_CategoryCourse: 'Failed to fetch CategoryCourse.'
}
/**
 * Retrieves a specific category course by its ID.
 * If the category course does not exist, returns a not found error.
 *
 * @author Quoc
 * @route GET /categoryCourses/:id
 * @param {string} req.params.id - The ID of the category course to retrieve.
 * @returns {Promise<Object>} The category course object if found, or an error message if not found.
 * @throws {404} If the category course with the given ID is not found.
 * @throws {500} If an internal server error occurs while fetching the category course.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Find the category course by primary key (ID)
    const CategoryCourse = await models.CategoryCourse.findByPk(id)

    // If the category course is not found, return a 404 error
    if (!CategoryCourse) {
      return res.status(404).json({ message: MESSAGES5.COURSE_NOT_FOUND })
    }

    // Return the category course data as a JSON response
    res.json(CategoryCourse)
  } catch (error) {
    // Handle any internal server errors
    res.status(500).json({ message: MESSAGES5.FAILED_TO_FETCH_CategoryCourse, error: error.message })
  }
})

module.exports = router
