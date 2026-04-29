const express = require('express')
const { models } = require('../models')
const { isAuthenticated, isAuthenticatedWithRoleCheck } = require('../middlewares/authentication')
const router = express.Router()
/**
 * Get notifications for user.
 *
 * @author Canh
 * @route GET /getNotiByUserId
 * @param {string} req.user.id - The ID of the authentiated user.
 * @param {string} req.query.limit - The maximum number of notifications to return.
 * @param {string} req.query.offset - The number of notifications to skip before starting to collect the result set.
 * @returns {Promise<Object|null>} The response object containing the total number of unread notifications and the list of notifications.
 */
router.get('/getNotiByUserId', isAuthenticatedWithRoleCheck, async (req, res) => {
  // Extract userId and pagination parameters from request
  const userId = req.user.id
  const limit = parseInt(req.query.limit, 10) || 5
  const offset = parseInt(req.query.offset, 10) || 0

  try {
    // Retrieve notifications for the user with pagination
    const { rows } = await models.NotificationRecipient.findAndCountAll({
      where: { userId },
      include: [{
        model: models.Notification,
        as: 'Notification',
        required: true
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })
    // Count the number of unread notifications for the user
    const countUnread = await models.NotificationRecipient.count({ where: { userId, status: false } })
    // Send the response with the total number of unread notifications and the list of notifications
    res.json({ total: countUnread, notifications: rows })
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Create a new notification.
 *
 * @author Canh
 * @route POST /createNotification
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {string} req.body.data.title - The title of the notification.
 * @param {string} req.body.data.message - The message content of the notification.
 * @param {string} req.body.data.url - The URL associated with the notification.
 * @returns {Promise<Object>} The response object containing the created notification and its recipient.
 */
router.post('/createNotification', isAuthenticated, async (req, res) => {
  // Extract userId, title, message, url from request
  const { title, message, url } = req.body.data
  const userId = req.user.id
  try {
    // Create a new notification
    const notification = await models.Notification.create({ title, message, url })
    // Associate the notification with the recipient (authenticated user)
    const recipient = await models.NotificationRecipient.create({
      notificationId: notification.id,
      userId,
      status: false
    })
    // Combine notification and recipient data into a single response object
    const notificationWithRecipients = {
      ...notification.toJSON(),
      recipients: {
        ...recipient.toJSON(),
        recipientId: recipient.id
      }
    }
    // Send the response with the created notification and its recipient
    res.status(201).json(notificationWithRecipients)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Mark a notification as read.
 *
 * @author Canh
 * @route PUT /readNotification
 * @param {string} req.body.data.recipientsId - The ID of the notification recipient to be marked as read.
 * @returns {Promise<Object>} The response object containing the updated notification.
 */
router.put('/readNotification', isAuthenticated, async (req, res) => {
  // Extract recipientsId from request
  const recipientsId = req.body.data.recipientsId
  try {
    // Find the notification recipient by primary key (ID)
    const notification = await models.NotificationRecipient.findByPk(recipientsId)
    // If the notification recipient is not found, return a 404 error
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    // Update the status of the notification to "read"
    await notification.update({ status: true })
    // Send the response with the updated notification
    res.json(notification)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Mark all notifications as read for a user.
 *
 * @author Canh
 * @route PUT /readAllNotification
 * @param {string} req.user.id - The ID of the authenticated user.
 * @returns {Promise<Object>} The response object containing a success message.
 */
router.put('/readAllNotification', isAuthenticated, async (req, res) => {
  // Extract userId from the authenticated user
  const userId = req.user.id
  try {
    // Update the status of all notifications to "read" for the authenticated user
    await models.NotificationRecipient.update({ status: true }, { where: { userId } })
    // Count the number of unread notifications (should be 0 now)
    const countUnread = await models.NotificationRecipient.count({ where: { userId, status: false } })
    // Send the response with a success message and the new unread count
    res.json({ message: 'All notifications have been read', total: countUnread })
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Remove a notification.
 *
 * @author Canh
 * @route DELETE /removeNotification
 * @param {string} req.body.recipientsId - The ID of the notification recipient to be deleted.
 * @returns {Promise<Object>} The response object containing the deleted notification.
 */
router.delete('/removeNotification', isAuthenticated, async (req, res) => {
  // Extract recipientsId from request body
  const recipientsId = req.body.recipientsId
  try {
    // Find the notification recipient by primary key (ID)
    const notification = await models.NotificationRecipient.findByPk(recipientsId)
    // If the notification recipient is not found, return a 404 error
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    // Delete the notification recipient
    await notification.destroy()
    // Send the response with the deleted notification
    res.json(notification)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Remove all notifications for a user.
 *
 * @author Canh
 * @route DELETE /removeAllNotification
 * @param {string} req.user.id - The ID of the authenticated user.
 * @returns {Promise<Object>} The response object containing a success message.
 */
router.delete('/removeAllNotification', isAuthenticated, async (req, res) => {
  // Extract userId from the authenticated user
  const userId = req.user.id
  try {
    // Delete all notifications for the authenticated user
    await models.NotificationRecipient.destroy({ where: { userId } })
    // Send the response with a success message
    res.json({ message: 'All notifications have been removed' })
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Mark a notification as unread.
 *
 * @author Canh
 * @route PUT /markAsUnread
 * @param {string} req.body.data.recipientsId - The ID of the notification recipient to be marked as unread.
 * @returns {Promise<Object>} The response object containing the updated notification.
 */
router.put('/markAsUnread', isAuthenticated, async (req, res) => {
  // Extract recipientsId from request body
  const recipientsId = req.body.data.recipientsId
  try {
    // Find the notification recipient by primary key (ID)
    const notification = await models.NotificationRecipient.findByPk(recipientsId)
    // If the notification recipient is not found, return a 404 error
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    // Update the status of the notification to "unread"
    await notification.update({ status: false })
    // Send the response with the updated notification
    res.json(notification)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Mark all notifications as unread for a user.
 *
 * @author Canh
 * @route PUT /markAllAsUnread
 * @param {string} req.user.id - The ID of the authenticated user.
 * @returns {Promise<Object>} The response object containing a success message.
 */
router.put('/markAllAsUnread', isAuthenticated, async (req, res) => {
  // Extract userId from the authenticated user
  const userId = req.user.id
  try {
    // Update the status of all notifications to "unread" for the authenticated user
    await models.NotificationRecipient.update({ status: false }, { where: { userId } })
    // Count the number of unread notifications (should be all now)
    const countUnread = await models.NotificationRecipient.count({ where: { userId, status: false } })
    // Send the response with a success message and the new unread count
    res.json({ message: 'All notifications have been marked as unread', total: countUnread })
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
module.exports = router
