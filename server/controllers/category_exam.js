const express = require('express')
const router = express.Router()
const { models } = require('../models')
/**
 * Retrieves all category exams.
 *
 * @route GET /
 * @returns {Promise<Object>} A JSON array of category exam objects.
 * @throws {Error} If an error occurs during retrieval.
 */
router.get('/', async (req, res) => {
  try {
    const categories = await models.CategoryExam.findAll()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
