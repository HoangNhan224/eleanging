const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { Sequelize } = require('sequelize')
const { broadcastPermissionChangeWS, broadcastNewNotification } = require('../socket')
const MASSAGE = {
  PERMISSION_NOT_FOUND: 'Permission not found',
  NO_CREATE_PERMISSION: 'No can not create permission',
  NO_UPDATE_PERMISSION: 'No can not update permission',
  NO_DELETE_PERMISSION: 'No can not delete permission',
  REQUIRED: 'Name or description are required',
  NAME_REQUIRED: 'Name are required',
  DESCRIPTION_REQUIRED: 'Description are required',
  ROUTER_REQUIRED: 'Router are required',
  NAME_NOT_NUMBER: 'Name must not contain numbers',
  DESCRIPTION_NOT_NUMBER: 'Description must not contain numbers',
  NAME_ALREADY_EXISTS: 'Name already exists',
  DESCRIPTION_ALREADY_EXISTS: 'Description already exists',
  NO_ASSIGN_PERMISSION: 'No can not assign permission to role',
  DELETE_PERMISSION_SUCCESS: 'Delete permission successfully',
  ROLE_NOT_FOUND: 'Role not found',
  PERMISSIONIDS_MUST_BE_ARRAY: 'permissionIds must be an array',
  PERMISSIONIDS_NOT_VALID: 'One or more permissionIds are invalid',
  ASSIGN_SECURITY_SUCCESS: 'Assign permission to role successfully',
  NAME_REQUIRED_NUMBER: 'Name must not contain numbers',
  DESCRIPTION_REQUIRED_NUMBER: 'Description must not contain numbers',
  URL_METHOD_ALREADY_EXISTS: 'The combination of url and method already exists',
  URL_METHOD_ANY_EXISTS: 'The combination of url and method with ANY already exists'
}

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
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

// get all permission
/**
 * Retrieves all permissions.
 *
 * @author Hien
 * @route GET /
 * @returns {Promise<Array<Object>>} A list of all permissions.
 * @throws {Error} If there is an error retrieving the permissions.
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const role = await models.Permission.findAll()
    logInfo(req, role)
    res.json(role)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.PERMISSION_NOT_FOUND })
  }
})

/**
 * Creates a new permission.
 *
 * @author Hien
 * @route POST /
 * @param {Object} req.body.data - The data for the new permission.
 * @param {string} req.body.data.name - The name of the permission.
 * @param {string} req.body.data.description - The description of the permission.
 * @param {string} req.body.data.url - The URL of the permission.
 * @param {string} req.body.data.method - The HTTP method of the permission.
 * @returns {Promise<Object>} The created permission.
 * @throws {Error} If there is an error creating the permission.
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, url, method } = req.body.data
    console.log('check data post server:___________ ', req.body.data)
    // TODO Validate name
    if (!name) {
      logError(req, MASSAGE.NAME_REQUIRED)
      return res.status(400).json({
        errorCode: 'NAME_REQUIRED',
        message: MASSAGE.NAME_REQUIRED,
        field: 'name'
      })
    }
    if (!isNaN(name)) {
      logError(req, MASSAGE.NAME_NOT_NUMBER)
      return res.status(400).json({
        errorCode: 'NAME_CANNOT_BE_NUMBER',
        message: MASSAGE.NAME_NOT_NUMBER,
        field: 'name'
      })
    }
    const existingPermission = await models.Permission.findOne({ where: { name } })
    if (existingPermission) {
      logError(req, MASSAGE.NAME_ALREADY_EXISTS)
      return res.status(409).json({
        errorCode: 'NAME_ALREADY_EXISTS',
        message: MASSAGE.NAME_ALREADY_EXISTS,
        field: 'name'
      })
    }

    // TODO Validate description
    if (!description) {
      logError(req, MASSAGE.DESCRIPTION_REQUIRED)
      return res.status(400).json({
        errorCode: 'DESCRIPTION_REQUIRED',
        message: MASSAGE.DESCRIPTION_REQUIRED,
        field: 'description'
      })
    }
    if (!isNaN(description)) {
      logError(req, MASSAGE.DESCRIPTION_NOT_NUMBER)
      return res.status(400).json({
        errorCode: 'DESCRIPTION_CANNOT_BE_NUMBER',
        message: MASSAGE.DESCRIPTION_NOT_NUMBER,
        field: 'description'
      })
    }
    const existingDescription = await models.Permission.findOne({ where: { description } })
    if (existingDescription) {
      logError(req, MASSAGE.DESCRIPTION_ALREADY_EXISTS)
      return res.status(409).json({
        errorCode: 'DESCRIPTION_ALREADY_EXISTS',
        message: MASSAGE.DESCRIPTION_ALREADY_EXISTS,
        field: 'description'
      })
    }

    // TODO Validate URL and method
    if (!url || !method) {
      logError(req, MASSAGE.ROUTER_REQUIRED)
      return res.status(400).json({
        errorCode: 'ROUTE_REQUIRED',
        message: MASSAGE.ROUTER_REQUIRED,
        field: 'route'
      })
    }

    // TODO Check if the combination of URL and method already exists
    const existingUrlMethod = await models.Permission.findOne({ where: { url, method } })
    if (existingUrlMethod) {
      logError(req, MASSAGE.URL_METHOD_ALREADY_EXISTS)
      return res.status(409).json({
        errorCode: 'URL_METHOD_ALREADY_EXISTS',
        message: MASSAGE.URL_METHOD_ALREADY_EXISTS,
        field: 'route'
      })
    }

    // Extract the URL pattern (adjust as needed)
    const urlPattern = url.split('/').slice(0, 4).join('/')

    if (method !== 'ANY') {
      // Prevent adding specific methods if 'ANY' exists for the same URL pattern
      const existingAnyMethod = await models.Permission.findOne({
        where: { url: urlPattern, method: 'ANY' }
      })
      if (existingAnyMethod) {
        logError(req, MASSAGE.URL_METHOD_ANY_EXISTS)
        return res.status(409).json({
          errorCode: 'URL_METHOD_ANY_EXISTS',
          message: MASSAGE.URL_METHOD_ANY_EXISTS,
          field: 'route'
        })
      }
    }

    // Create the new permission
    const permission = await models.Permission.create({ name, description, url, method })
    // TODO Find admin role
    const adminRole = await models.Role.findOne({
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), 'admin')
    })
    if (adminRole) {
      // TODO Assign this new permission to the admin role
      await models.RoleToPermission.create({ roleId: adminRole.id, permissionId: permission.id })
    }

    logInfo(req, permission)
    res.json(permission)
  } catch (error) {
    logError(req, error)
    res.status(500).json({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: MASSAGE.NO_CREATE_PERMISSION
    })
  }
})

/**
 * Updates an existing permission.
 *
 * @author Hien
 * @route PUT /:id
 * @param {string} req.params.id - The ID of the permission to update.
 * @param {Object} req.body.data - The data for updating the permission.
 * @param {string} req.body.data.name - The new name of the permission.
 * @param {string} req.body.data.description - The new description of the permission.
 * @param {string} req.body.data.url - The new URL of the permission.
 * @param {string} req.body.data.method - The new HTTP method of the permission.
 * @returns {Promise<Object>} The updated permission.
 * @throws {Error} If there is an error updating the permission.
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, url, method } = req.body.data
    console.log('check data put server___________________', req.body.data)
    if (!url || !method || url.trim() === '' || method.trim() === '') {
      logError(req, MASSAGE.ROUTER_REQUIRED)
      return res.status(400).json({
        errorCode: 'ROUTER_REQUIRED',
        message: MASSAGE.ROUTER_REQUIRED,
        field: 'route'
      })
    }
    const permission = await models.Permission.findByPk(id)
    if (!permission) {
      logError(req, MASSAGE.PERMISSION_NOT_FOUND)
      return res.status(404).json({
        errorCode: 'PERMISSION_NOT_FOUND',
        message: MASSAGE.PERMISSION_NOT_FOUND
      })
    }
    if (name && name !== permission.name) {
      if (!isNaN(name)) {
        logError(req, MASSAGE.NAME_REQUIRED_NUMBER)
        return res.status(400).json({
          errorCode: 'NAME_REQUIRED_NUMBER',
          message: MASSAGE.NAME_REQUIRED_NUMBER,
          field: 'name'
        })
      }
      const existingPermission = await models.Permission.findOne({ where: { name } })
      if (existingPermission && existingPermission.id !== id) {
        logError(req, MASSAGE.NAME_ALREADY_EXISTS)
        return res.status(409).json({
          errorCode: 'NAME_ALREADY_EXISTS',
          message: MASSAGE.NAME_ALREADY_EXISTS,
          field: 'name'
        })
      }
      permission.name = name
    }
    if (description && description !== permission.description) {
      if (!isNaN(description)) {
        logError(req, MASSAGE.DESCRIPTION_REQUIRED_NUMBER)
        return res.status(400).json({
          errorCode: 'DESCRIPTION_REQUIRED_NUMBER',
          message: MASSAGE.DESCRIPTION_REQUIRED_NUMBER,
          field: 'description'
        })
      }
      const existingPermission = await models.Permission.findOne({ where: { description } })
      if (existingPermission && existingPermission.id !== id) {
        logError(req, MASSAGE.DESCRIPTION_ALREADY_EXISTS)
        return res.status(409).json({
          errorCode: 'DESCRIPTION_ALREADY_EXISTS',
          message: MASSAGE.DESCRIPTION_ALREADY_EXISTS,
          field: 'description'
        })
      }
      permission.description = description
    }
    if ((url && url !== permission.url) || (method && method !== permission.method)) {
      if (!url || !method) {
        logError(req, MASSAGE.ROUTER_REQUIRED)
        return res.status(400).json({
          errorCode: 'ROUTER_REQUIRED',
          message: MASSAGE.ROUTER_REQUIRED,
          field: 'route'
        })
      }
      if (method !== 'ANY') {
        const existingPermission = await models.Permission.findOne({
          where: {
            url,
            method,
            id: { [Sequelize.Op.ne]: id }
          }
        })
        if (existingPermission) {
          logError(req, MASSAGE.URL_METHOD_ALREADY_EXISTS)
          return res.status(409).json({
            errorCode: 'URL_METHOD_ALREADY_EXISTS',
            message: MASSAGE.URL_METHOD_ALREADY_EXISTS,
            field: 'route'
          })
        }
        const existingAnyMethod = await models.Permission.findOne({
          where: {
            url,
            method: 'ANY',
            id: { [Sequelize.Op.ne]: id }
          }
        })
        if (existingAnyMethod) {
          logError(req, MASSAGE.URL_METHOD_ANY_EXISTS)
          return res.status(409).json({
            errorCode: 'URL_METHOD_ANY_EXISTS',
            message: MASSAGE.URL_METHOD_ANY_EXISTS,
            field: 'route'
          })
        }
      } else {
        const existingAnyMethod = await models.Permission.findOne({
          where: {
            url,
            method: 'ANY',
            id: { [Sequelize.Op.ne]: id }
          }
        })
        if (existingAnyMethod) {
          logError(req, MASSAGE.URL_METHOD_ANY_EXISTS)
          return res.status(409).json({
            errorCode: 'URL_METHOD_ANY_EXISTS',
            message: MASSAGE.URL_METHOD_ANY_EXISTS,
            field: 'route'
          })
        }
      }
      permission.url = url
      permission.method = method
    }
    await permission.save()
    logInfo(req, permission)
    res.json(permission)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ errorCode: 'INTERNAL_SERVER_ERROR', message: MASSAGE.NO_UPDATE_PERMISSION })
  }
})

/**
 * Deletes an existing permission.
 *
 * @author Hien
 * @route DELETE /:id
 * @param {string} req.params.id - The ID of the permission to delete.
 * @returns {Promise<Object>} A success message if the permission is deleted.
 * @throws {Error} If there is an error deleting the permission.
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    // TODO Find the permission by primary key
    const permission = await models.Permission.findByPk(id)
    if (!permission) {
      logError(req, MASSAGE.PERMISSION_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.PERMISSION_NOT_FOUND })
    }
    // TODO Delete the associated RoleToPermission entries
    await models.RoleToPermission.destroy({ where: { permissionId: id } })
    // TODO Delete the permission
    await permission.destroy()
    logInfo(req, { message: MASSAGE.DELETE_PERMISSION_SUCCESS })
    res.json({ message: MASSAGE.DELETE_PERMISSION_SUCCESS })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_DELETE_PERMISSION })
  }
})

/**
 * Retrieves permissions by role ID.
 *
 * @author Hien
 * @route GET /by-role/:roleId
 * @param {string} req.params.roleId - The ID of the role to retrieve permissions for.
 * @returns {Promise<Array<Object>>} A list of permissions associated with the specified role.
 * @throws {Error} If there is an error retrieving the permissions.
 */
router.get('/by-role/:roleId', isAuthenticated, async (req, res) => {
  try {
    const { roleId } = req.params
    // TODO Fetch permissions associated with the specified role ID
    const permissions = await models.Permission.findAll({
      attributes: ['name', 'description'],
      include: [
        {
          model: models.Role,
          where: {
            id: roleId
          },
          attributes: []
        }
      ]
    })
    logInfo(req, permissions)
    res.json(permissions)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.PERMISSION_NOT_FOUND })
  }
})

/**
 * Assigns permissions to a role.
 *
 * @route POST /assign-to-role
 * @param {Object} req.body.data - The data for assigning permissions.
 * @param {string} req.body.data.roleId - The ID of the role to assign permissions to.
 * @param {Array<string>} req.body.data.permissionIds - The IDs of the permissions to assign.
 * @returns {Promise<Object>} A success message if the permissions are assigned.
 * @throws {Error} If there is an error assigning the permissions.
 */
router.post('/assign-to-role', isAuthenticated, async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body.data
    // TODO Check if permissionIds is an array
    if (!Array.isArray(permissionIds)) {
      logError(req, MASSAGE.PERMISSIONIDS_MUST_BE_ARRAY)
      return res.status(400).json({ message: MASSAGE.PERMISSIONIDS_MUST_BE_ARRAY })
    }

    // TODO Fetch the role and permissions concurrently
    const [role, permissions] = await Promise.all([
      models.Role.findByPk(roleId),
      models.Permission.findAll({
        where: {
          id: permissionIds
        }
      })
    ])

    // TODO Check if the role exists
    if (!role) {
      logError(req, MASSAGE.ROLE_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.ROLE_NOT_FOUND })
    }

    // TODO Check if all permission IDs are valid
    if (permissions.length !== permissionIds.length) {
      logError(req, MASSAGE.PERMISSIONIDS_NOT_VALID)
      return res.status(400).json({ message: MASSAGE.PERMISSIONIDS_NOT_VALID })
    }

    // TODO Assign the permissions to the role
    await role.setPermissions(permissionIds)
    logInfo(req, { message: MASSAGE.ASSIGN_SECURITY_SUCCESS })
    await models.Role.update(
      { roleVersion: Sequelize.literal('roleVersion + 1') },
      { where: { id: roleId } }
    )
    broadcastPermissionChangeWS(role.description)

    // TODO gET all users in the role
    const usersInRole = await models.User.findAll({
      where: { roleId: role.id },
      attributes: ['id']
    })

    if (usersInRole && usersInRole.length > 0) {
      const dbNotification = await models.Notification.create({
        title: 'Change Permission',
        message: 'Quản trị viên đã cập nhật các quyền truy cập của bạn'
      })

      // TODO Create notification recipients for each user in the role
      for (const user of usersInRole) {
        const notificationRecipient = await models.NotificationRecipient.create({
          userId: user.id,
          notificationId: dbNotification.id,
          status: 0
        })

        const notificationPayload = {
          id: notificationRecipient.id,
          notificationId: dbNotification.id,
          status: notificationRecipient.status,
          userId: notificationRecipient.userId,
          createdAt: notificationRecipient.createdAt.toISOString(),
          updatedAt: notificationRecipient.updatedAt.toISOString(),
          notificationDetails: {
            id: dbNotification.id,
            title: dbNotification.title,
            message: dbNotification.message,
            createdAt: dbNotification.createdAt.toISOString(),
            updatedAt: dbNotification.updatedAt.toISOString()
          }
        }
        broadcastNewNotification(user.id, notificationPayload)
      }
    }

    res.json({ message: MASSAGE.ASSIGN_SECURITY_SUCCESS })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_ASSIGN_PERMISSION })
  }
})

/**
 * Retrieves paginated permissions with optional search and sorting.
 *
 * @route GET /pagination
 * @param {string} req.query.page - The page number for pagination (default is '1').
 * @param {string} req.query.size - The number of records per page (default is '5').
 * @param {string} req.query.search - The search condition for filtering permissions.
 * @param {string} req.query.sortKey - The key to sort the results by.
 * @param {string} req.query.sortDirection - The direction to sort the results ('ASC' or 'DESC').
 * @returns {Promise<Object>} An object containing pagination details and the list of permissions.
 * @throws {Error} If there is an error retrieving the permissions.
 */
router.get('/pagination', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '5',
      search: searchCondition,
      sortKey,
      sortDirection
    } = req.query

    // TODO Determine the order for sorting based on sortKey and sortDirection
    const order = (sortKey && sortDirection && sortDirection !== 'none')
      ? sortKey.includes('.')
        ? [[models[sortKey.split('.')[0]], sortKey.split('.')[1], sortDirection]]
        : [[sortKey, sortDirection]]
      : [['id', 'DESC']]

    // TODO Fetch permissions from the database with specified attributes
    const dataFromDatabase = await models.Permission.findAll({
      attributes: ['id', 'name', 'description', 'url', 'method'],
      order: order
    })

    // TODO Apply search condition to filter permissions by description
    const dataAfterNameSearch = applyNameSearch(
      searchCondition,
      dataFromDatabase
    )

    // TODO Calculate total records and total pages for pagination
    const totalRecords = dataAfterNameSearch.length
    const totalPages = Math.ceil(totalRecords / Number(size))

    // TODO Get the data for the current page window
    const dataOfCurrentWindow = getDataInWindowSize(
      size,
      page,
      dataAfterNameSearch
    )

    // TODO Prepare the response object
    const response = {
      page: Number(page),
      size: Number(size),
      totalPages,
      totalRecords,
      currentRecords: dataOfCurrentWindow.length,
      data: dataOfCurrentWindow
    }
    res.json(response)
    logInfo(req, dataOfCurrentWindow)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.PERMISSION_NOT_FOUND })
  }
})

/**
 * Applies a search condition to filter permissions by their description.
 *
 * @author Hien
 * @param {string} searchCondition - The search condition for filtering permissions.
 * @param {Array<Object>} data - The array of permission data to be filtered.
 * @returns {Array<Object>} The filtered array of permission data.
 */
function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.description?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
    )
  }
  return data
}

/**
 * Retrieves a subset of data based on the specified page and size.
 *
 * @author Hien
 * @param {number} size - The number of records per page.
 * @param {number} page - The page number for pagination.
 * @param {Array<Object>} data - The array of data to be paginated.
 * @returns {Array<Object>} The subset of data for the specified page.
 */
function getDataInWindowSize (size, page, data) {
  if (!isNaN(Number(size)) && !isNaN(Number(page))) {
    data = data.slice(
      Number(size) * (Number(page) - 1),
      Number(size) * Number(page)
    )
  }
  return data
}

module.exports = router
