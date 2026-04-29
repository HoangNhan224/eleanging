const express = require('express')
const { models } = require('../models')
const { isAuthenticated, checkUserPermission } = require('../middlewares/authentication')
const router = express.Router()
const { Sequelize } = require('sequelize')

const { infoLogger, errorLogger } = require('../logs/logger')

const MASSAGE = {
  ROLE_NOT_FOUND: 'Role not found',
  ROLE_ALREADY_EXISTS: 'Role already exists',
  DELETE_ROLE_SUCCESS: 'Delete role successfully',
  NO_CREATE_ROLE: 'No can not create role',
  NO_UPDATE_ROLE: 'No can not update role',
  NO_DELETE_ROLE: 'No can not delete role',
  NAME_REQUIRED: 'Name are required',
  DESCRIPTION_REQUIRED: 'Description are required',
  NAME_REQUIRED_NUMBER: 'Name must not contain numbers',
  DESCRIPTION_REQUIRED_NUMBER: 'Description must not contain numbers',
  NAME_ALREADY_EXISTS: 'Name already exists',
  DESCRIPTION_ALREADY_EXISTS: 'Description already exists',
  ROLE_IS_BEING_USED: 'This role is being used',
  NAME_OR_DESCRIPTION_REQUIRED: 'Name or description must be string'
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
 * Retrieves all roles.
 *
 * @author Hien
 * @route GET /
 * @returns {Promise<Array<Object>>} A list of all roles.
 * @throws {Error} If there is an error retrieving the roles.
 */
router.get('/', isAuthenticated, async (_, res) => {
  try {
    const role = await models.Role.findAll()
    res.json(role)
    logInfo(_, role)
  } catch (error) {
    logError(_, error)
    res.status(500).json({ message: MASSAGE.ROLE_NOT_FOUND })
  }
})

/**
 * Creates a new role.
 *
 * @author Hien
 * @route POST /
 * @param {Object} req.body.data - The data for the new role.
 * @param {string} req.body.data.name - The name of the role.
 * @param {string} req.body.data.description - The description of the role.
 * @returns {Promise<Object>} The created role.
 * @throws {Error} If there is an error creating the role.
 */
router.post('/', isAuthenticated, checkUserPermission, async (req, res) => {
  try {
    // console.log('req.body', req.body)
    const { name, description } = req.body.data
    // TODO Validate name
    if (!name) {
      logError(req, MASSAGE.NAME_REQUIRED)
      return res.status(400).json({ message: MASSAGE.NAME_REQUIRED, field: 'name' })
    }
    if (name && !isNaN(name)) {
      logError(req, MASSAGE.NAME_REQUIRED_NUMBER)
      return res.status(400).json({ message: MASSAGE.NAME_REQUIRED_NUMBER, field: 'name' })
    }

    // TODO Validate description
    if (!description) {
      logError(req, MASSAGE.DESCRIPTION_REQUIRED)
      return res.status(400).json({ message: MASSAGE.DESCRIPTION_REQUIRED, field: 'description' })
    }
    if (description && !isNaN(description)) {
      logError(req, MASSAGE.DESCRIPTION_REQUIRED_NUMBER)
      return res.status(400).json({ message: MASSAGE.DESCRIPTION_REQUIRED_NUMBER, field: 'description' })
    }

    // TODO Check if role with the same name already exists
    const existingRole = await models.Role.findOne({ where: { name } })
    if (existingRole) {
      logError(req, MASSAGE.ROLE_ALREADY_EXISTS)
      return res.status(409).json({ message: MASSAGE.ROLE_ALREADY_EXISTS, field: 'name' })
    }
    // TODO Check if role with the same description already exists
    const existingRole1 = await models.Role.findOne({ where: { description } })
    if (existingRole1) {
      logError(req, MASSAGE.DESCRIPTION_ALREADY_EXISTS)
      return res.status(409).json({ message: MASSAGE.DESCRIPTION_ALREADY_EXISTS, field: 'description' })
    }
    // TODO Create the new role
    const role = await models.Role.create({ name, description })

    // TODO Find the "user" role
    const userRole = await models.Role.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('description')),
        'user'
      )
    })

    console.log('userRole', userRole)
    if (userRole) {
      // TODO Get all permissions of the "user" role
      const userPermissions = await models.RoleToPermission.findAll({
        where: { roleId: userRole.id },
        attributes: ['permissionId']
      })

      // TODO Assign all permissions of the "user" role to the new role
      const roleToPermissions = userPermissions.map(permission => ({
        roleId: role.id,
        permissionId: permission.permissionId
      }))
      await models.RoleToPermission.bulkCreate(roleToPermissions)
    }

    res.json(role)
    logInfo(req, role)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_CREATE_ROLE })
  }
})

/**
 * Updates a role by its ID.
 *
 * @author Hien
 * @route PUT /:id
 * @param {string} req.params.id - The ID of the role to be updated.
 * @param {Object} req.body.data - The data to update the role with.
 * @param {string} req.body.data.name - The new name of the role.
 * @param {string} req.body.data.description - The new description of the role.
 * @returns {Promise<Object>} The updated role.
 * @throws {Error} If there is an error updating the role.
 */
router.put('/:id', isAuthenticated, checkUserPermission, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body.data
    // TODO Find the role by its ID
    const role = await models.Role.findByPk(id)
    if (!role) {
      logError(req, MASSAGE.ROLE_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.ROLE_NOT_FOUND })
    }

    // TODO Check if the new name is provided
    if (name) {
      // TODO Find if there is an existing role with the same name
      const existingRole = await models.Role.findOne({ where: { name } })
      // TODO If an existing role is found and it's not the current role, return 409
      if (existingRole && existingRole.id !== id) {
        logError(req, MASSAGE.NAME_ALREADY_EXISTS)
        return res.status(409).json({ message: MASSAGE.NAME_ALREADY_EXISTS })
      }
      // TODO Update the role's name
      role.name = name
    }

    // TODO Update the role's description if provided
    if (description) role.description = description
    // TODO Save the updated role to the database
    await role.save()
    res.json(role)
    logInfo(req, role)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_UPDATE_ROLE })
  }
})

/**
 * Deletes a role by its ID.
 *
 * @author Hien
 * @route DELETE /:id
 * @param {string} req.params.id - The ID of the role to be deleted.
 * @returns {Promise<Object>} A message indicating the result of the deletion.
 * @throws {Error} If there is an error during the deletion process.
 */
router.delete('/:id', isAuthenticated, checkUserPermission, async (req, res) => {
  try {
    const { id } = req.params
    // TODO Find the role by its primary key (ID)
    const role = await models.Role.findByPk(id)
    if (!role) {
      logError(req, MASSAGE.ROLE_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.ROLE_NOT_FOUND })
    }
    // TODO Check if any user is using this role
    const users = await models.User.findAll({ where: { roleId: id } })
    if (users.length > 0) {
      logError(req, MASSAGE.ROLE_IS_BEING_USED)
      return res.status(400).json({ message: MASSAGE.ROLE_IS_BEING_USED })
    }
    // TODO Delete all permissions associated with the role
    await models.RoleToPermission.destroy({ where: { roleId: id } })
    // TODO Delete the role
    await role.destroy()
    res.json({ message: MASSAGE.DELETE_ROLE_SUCCESS })
    logInfo(req, { message: MASSAGE.DELETE_ROLE_SUCCESS })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_DELETE_ROLE })
  }
})

module.exports = router
