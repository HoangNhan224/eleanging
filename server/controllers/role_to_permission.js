const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

const { infoLogger, errorLogger } = require('../logs/logger')

const MASSAGE = {
  PERMISSION_NOT_FOUND: 'Permissions not found',
  ROLE_NOT_FOUND: 'Role not found',
  ROLE_TO_PERMISSION_NOT_FOUND: 'RoleToPermission not found',
  ROLE_TO_PERMISSION_DELETED_SUCCESSFULLY: 'RoleToPermission deleted successfully'
}

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request: request,
    error: error,
    user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request: request,
    response: response,
    user: req.user.id
  })
}

/**
 * Retrieves permissions associated with a specific role.
 *
 * @author Hien
 * @route GET /roles/:roleId
 * @param {string} req.params.roleId - The ID of the role.
 * @returns {Promise<Array<Object>>} A list of permissions associated with the role.
 * @throws {Error} If there is an error retrieving the permissions.
 */
router.get('/roles/:roleId', isAuthenticated, async (req, res) => {
  try {
    const { roleId } = req.params
    // TODO Find all permissions associated with the roleId
    const permissions = await models.RoleToPermission.findAll({
      where: { roleId },
      attributes: ['roleId', 'permissionId'],
      include: { model: models.Permission, attributes: ['name', 'description'] }
    })
    // TODO Check if permissions are found
    if (!permissions) {
      logError(req, MASSAGE.PERMISSION_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.PERMISSION_NOT_FOUND })
    }
    // TODO Respond with the list of permissions
    res.json(permissions)
    logInfo(req, permissions)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.PERMISSION_NOT_FOUND })
  }
})

/**
 * Retrieves roles associated with a specific permission.
 *
 * @author Hien
 * @route GET /permissions/:permissionId
 * @param {string} req.params.permissionId - The ID of the permission.
 * @returns {Promise<Array<Object>>} A list of roles associated with the permission.
 * @throws {Error} If there is an error retrieving the roles.
 */
router.get('/permissions/:permissionId', isAuthenticated, async (req, res) => {
  try {
    const { permissionId } = req.params
    // TODO Find all roles associated with the permissionId
    const roles = await models.RoleToPermission.findAll({
      where: { permissionId },
      attributes: ['roleId', 'permissionId'],
      include: { model: models.Role, attributes: ['name', 'description'] }
    })
    // TODO Check if roles are found
    if (!roles) {
      logError(req, MASSAGE.ROLE_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.ROLE_NOT_FOUND })
    }
    // TODO Respond with the list of roles
    res.json(roles)
    logInfo(req, roles)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.ROLE_NOT_FOUND })
  }
})

/**
 * Deletes a specific role-to-permission association.
 *
 * @author Hien
 * @route DELETE /:roleId/:permissionId
 * @param {string} req.params.roleId - The ID of the role.
 * @param {string} req.params.permissionId - The ID of the permission.
 * @returns {Promise<Object>} A message indicating the deletion status.
 * @throws {Error} If there is an error deleting the role-to-permission association.
 */
router.delete('/:roleId/:permissionId', isAuthenticated, async (req, res) => {
  try {
    const { roleId, permissionId } = req.params
    // TODO Find the role-to-permission association
    const roleToPermission = await models.RoleToPermission.findOne({
      where: { roleId, permissionId }
    })
    // TODO Check if the association is found
    if (!roleToPermission) {
      logError(req, MASSAGE.ROLE_TO_PERMISSION_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.ROLE_TO_PERMISSION_NOT_FOUND })
    }
    // TODO Delete the role-to-permission association
    await roleToPermission.destroy()
    logInfo(req, { message: MASSAGE.ROLE_TO_PERMISSION_DELETED_SUCCESSFULLY })
    res.json({ message: MASSAGE.ROLE_TO_PERMISSION_DELETED_SUCCESSFULLY })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.ROLE_TO_PERMISSION_DELETED_SUCCESSFULLY })
  }
})
module.exports = router
