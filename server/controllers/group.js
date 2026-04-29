const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')

// const { Client } = require('@elastic/elasticsearch')
// const esClient = new Client({ node: 'http://localhost:9200' })

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
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const groups = await models.Group.findAll({
      attributes: ['id', 'name']
    })
    res.json({ data: groups })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Get all groups.
 *
 * @author Canh
 * @route get /getAllGroup
 * @returns {Promise<Object>} The response object containing the list of groups or an error message.
 */
router.get('/getAllGroup', isAuthenticated, async (req, res) => {
  try {
    // Retrieve all groups from the database with specified attributes
    const groups = await models.Group.findAll({
      attributes: ['id', 'name', 'description']
    })
    // Log the retrieved groups for debugging purposes
    logInfo(req, groups)
    // Send the response with the list of groups
    res.json(groups)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})
module.exports = router
