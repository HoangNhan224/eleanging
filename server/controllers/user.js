const express = require('express')
const { models } = require('../models')
const { isAuthenticated, checkUserPermission } = require('../middlewares/authentication')
const bcrypt = require('bcrypt')
const {
  SALT_KEY
} = require('../utils')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { broadcastRoleChangeWS, broadcastNewNotification } = require('../socket')
const { UniqueConstraintError } = require('sequelize')
const MASSAGE = {
  USER_NOT_FOUND: 'User not found',
  NO_CREATE_USER: 'No can not create user',
  NO_UPDATE_USER: 'No can not update user',
  NO_DELETE_USER: 'No can not delete user',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  REQUIRED: 'Username or password or roleId are required',
  ROLE_NOT_FOUND: 'Role not found',
  DELETE_USER_SUCCESS: 'Delete user successfully',
  UPDATE_USER_SUCCESS: 'Update user',
  UPDATE_USER_ERROR: 'You can not update user role',
  NO_UPDATE: 'Current Password is incorrect'
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

/**
 * Retrieves all users.
 *
 * @author Hien
 * @route GET /
 * @returns {Promise<Array<Object>>} A list of all users.
 * @throws {Error} If there is an error retrieving the users.
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await models.User.findAll()
    logInfo(req, user)
    res.json(user)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND })
  }
})

/**
 * Retrieves paginated users with optional search and sorting.
 *
 * @author Hien
 * @route GET /pagination
 * @param {string} req.query.page - The page number for pagination (default is '1').
 * @param {string} req.query.size - The number of records per page (default is '5').
 * @param {string} req.query.search - The search condition for filtering users.
 * @param {string} req.query.sortKey - The key to sort the results by.
 * @param {string} req.query.sortDirection - The direction to sort the results ('ASC' or 'DESC').
 * @returns {Promise<Object>} An object containing pagination details and the list of users.
 * @throws {Error} If there is an error retrieving the users.
 */
router.get('/pagination', isAuthenticated, async (req, res) => {
  try {
    // TODO Destructure query parameters with default values
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

    // TODO Fetch users from the database with specified attributes and include roles
    const dataFromDatabase = await models.User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: models.Role,
          attributes: ['id', 'description']
        }
      ],
      order
    })

    // TODO Apply search condition to filter users by name
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

    // TODO Respond with pagination details and the current page data
    res.json({
      page: Number(page),
      size: Number(size),
      totalPages,
      totalRecords,
      currentRecords: dataOfCurrentWindow.length,
      data: dataOfCurrentWindow
    })
    logInfo(req, dataOfCurrentWindow)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND })
  }
})

/**
 * Applies a search condition to filter users by their first or last name.
 *
 * @author Hien
 * @param {string} searchCondition - The search condition for filtering users.
 * @param {Array<Object>} data - The array of user data to be filtered.
 * @returns {Array<Object>} The filtered array of user data.
 */
function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter((d) => {
      const searchLower = searchCondition.toLowerCase()
      const firstNameMatch = d.firstName?.toLowerCase()?.indexOf(searchLower) >= 0
      const lastNameMatch = d.lastName?.toLowerCase()?.indexOf(searchLower) >= 0
      return firstNameMatch || lastNameMatch
    })
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

/**
 * Creates a new user.
 *
 * @author Hien
 * @route POST /
 * @param {Object} req.body.data - The data for the new user.
 * @param {string} req.body.data.username - The username of the new user.
 * @param {string} req.body.data.password - The password of the new user.
 * @param {number} req.body.data.roleId - The role ID of the new user.
 * @returns {Promise<Object>} The created user object.
 * @throws {Error} If there is an error creating the user.
 */

router.post('/', isAuthenticated, checkUserPermission, async (req, res) => {
  logInfo(req, 'CREATE USER - Request received', { body: req.body }) // ✅ logInfo đầu vào

  try {
    const body = req.body.data || req.body
    const { username, roleId, email, firstName, lastName, groupId } = body

    if (!username || !roleId || !email || !firstName || !lastName || !groupId) {
      logInfo(req, 'CREATE USER - Missing fields', { body }) // ✅ logInfo missing
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Required fields missing'
      })
    }

    const existedUser = await models.User.findOne({ where: { username } })
    if (existedUser) {
      logInfo(req, 'CREATE USER - Username already exists', { username }) // ✅ logInfo trùng username
      return res.status(400).json({
        code: 'USERNAME_ALREADY_EXISTS',
        message: MASSAGE.USERNAME_ALREADY_EXISTS
      })
    }

    const existedEmail = await models.User.findOne({ where: { email } })
    if (existedEmail) {
      logInfo(req, 'CREATE USER - Email already exists', { email }) // ✅ logInfo trùng email
      return res.status(409).json({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already exists'
      })
    }
    // Tự generate password ngẫu nhiên 8 ký tự
    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!'
      return Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('')
    }

    const rawPassword = generateRandomPassword()

    // Hash password trước khi lưu DB
    const hashPassword = bcrypt.hashSync(rawPassword, SALT_KEY)

    // Tạo user
    const newUser = await models.User.create({
      username,
      password: hashPassword,
      roleId: Number(roleId),
      email,
      firstName,
      lastName,
      groupId: Number(groupId)
    })
    logInfo(req, 'CREATE USER - Success', { userId: newUser.id, username }) // ✅ logInfo thành công
    // Trả về kèm rawPassword để admin thông báo cho user
    return res.status(200).json({
      ...newUser.toJSON(),
      tempPassword: rawPassword
    })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      logError(req, MASSAGE.EMAIL_ALREADY_EXISTS)// ✅ logError constraint
      return res.status(409).json({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already exists'
      })
    }

    logError(req, MASSAGE.NO_CREATE_USER)// ✅ logError unexpected
    return res.status(500).json({
      message: MASSAGE.NO_CREATE_USER
    })
  }
})

// async function checkUserRole (req, res, next) {
//   const { id } = req.params
//   const userToEdit = await models.User.findByPk(id)

//   if (!userToEdit) {
//     logError(req, MASSAGE.USER_NOT_FOUND)
//     return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
//   }
//   const currentUserRole = req.user.GroupWithRoles.id
//   const userToEditRole = userToEdit.roleId
//   const newRole = req.body.data.roleId
//   console.log('------------------------------------------------------')
//   console.log('check user', req.user)
//   console.log('check current user role', currentUserRole)
//   console.log('check user to edit role', userToEditRole)
//   console.log('check new role', newRole)

//   // nếu user hiện tại là Manager và muốn sửa role của user khác thành Admin thì không được
//   if (currentUserRole === 2 && newRole === 1) {
//     return res.status(403).json({ message: MASSAGE.UPDATE_USER_ERROR })
//   }
//   // nếu user hiện tại là Admin thì được phép sửa role của user khác thành Admin
//   if (currentUserRole === 1) {
//     return next()
//   }
//   // nếu user hiện tại là Manager và muốn sửa role của user khác thành Manager hoặc User  thì được
//   if (currentUserRole === 2 && (userToEditRole === 2 || userToEditRole === 3)) {
//     return next()
//   }
//   return res.status(403).json({ message: MASSAGE.UPDATE_USER_ERROR })
// }

// // edit user
// router.put('/:id', isAuthenticated, checkUserRole, async (req, res) => {
//   try {
//     const { id } = req.params
//     console.log('------------------------------------------------------')
//     console.log('check user 1', req.params)
//     console.log('check user 2', req.body.data)
//     const { roleId } = req.body.data
//     const user = await models.User.findByPk(id)
//     if (!user) {
//       logError(req, MASSAGE.USER_NOT_FOUND)
//       return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
//     }
//     const updatedUser = await user.update({ roleId })
//     if (!updatedUser) {
//       logError(req, MASSAGE.NO_UPDATE_USER)
//       return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
//     }
//     logInfo(req, updatedUser)
//     res.json(updatedUser)
//   } catch (error) {
//     logError(req, error)
//     res.status(500).json({ message: MASSAGE.NO_UPDATE_USER })
//   }
// })

/**
 * Checks and updates the user's role and other details.
 *
 * @author Hien
 * @route PUT /:id
 * @param {string} req.params.id - The ID of the user to be updated.
 * @param {Object} req.body.data - The data for updating the user.
 * @param {number} req.body.data.roleId - The new role ID for the user.
 * @param {string} req.body.data.firstName - The new first name of the user.
 * @param {string} req.body.data.lastName - The new last name of the user.
 * @param {string} req.body.data.email - The new email of the user.
 * @param {string} req.body.data.gender - The new gender of the user.
 * @param {number} req.body.data.age - The new age of the user.
 * @param {string} req.body.data.password - The new password of the user.
 * @param {string} req.body.data.currentPassword - The current password of the user.
 * @returns {Promise<Object>} The updated user object.
 * @throws {Error} If there is an error updating the user.
 */
async function checkAndUpdateUserRole (req, res, next) {
  try {
    const { id } = req.params
    const { roleId, groupId, firstName, lastName, email, gender, age, password, currentPassword } = req.body.data
    // TODO Find the user to edit by ID
    const userToEdit = await models.User.findByPk(id)
    if (!userToEdit) {
      logError(req, MASSAGE.USER_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
    }

    const currentUserRole = req.user.GroupWithRoles.id
    const userToEditRole = userToEdit.roleId

    let updatedUser

    // TODO Check if password needs to be updated
    if (password) {
      // TODO Validate the current password
      const isPasswordValid = bcrypt.compareSync(currentPassword, userToEdit.password)
      if (!isPasswordValid) {
        return res.status(400).json({ message: MASSAGE.NO_UPDATE, field: 'currentPassword' })
      }
      // TODO Hash the new password
      const hashPassword = bcrypt.hashSync(password, SALT_KEY)
      // TODO Update user details including the new password
      updatedUser = await userToEdit.update({ firstName, lastName, email, gender, age, password: hashPassword, groupId })
    } else {
      // TODO Update user details without changing the password
      updatedUser = await userToEdit.update({ firstName, lastName, email, gender, age, groupId })
    }

    if (!updatedUser) {
      logError(req, MASSAGE.NO_UPDATE_USER)
      return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
    }
    logInfo(req, updatedUser)

    // TODO Check role update permissions
    if (userToEdit.roleId !== roleId) {
    // TODO If the new role ID is 1 (admin) and the current user's role is not 1 (admin), deny the update
      if (roleId === 1 && currentUserRole !== 1) {
        return res.status(403).json({ message: MASSAGE.UPDATE_USER_ERROR })
      }
      // TODO If the current user's role is 2 (manager) and the new role ID is 1 (admin), deny the update
      if (currentUserRole === 2 && roleId === 1) {
        return res.status(403).json({ message: MASSAGE.UPDATE_USER_ERROR })
      } else if (currentUserRole === 1) {
      // TODO If the current user's role is 1 (admin), allow the update
        const updatedUser = await userToEdit.update({ roleId })
        if (!updatedUser) {
          logError(req, MASSAGE.NO_UPDATE_USER)
          return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
        }
        logInfo(req, updatedUser)
        broadcastRoleChangeWS(roleId, userToEdit.id)
        const dbNotification = await models.Notification.create({
          title: 'Change Role',
          message: 'Quản trị viên đã cập nhật vai trò của bạn.'
        })
        const notificationRecipient = await models.NotificationRecipient.create({
          userId: userToEdit.id,
          notificationId: dbNotification.id,
          status: 0
        })

        const notificationPayloadForSocket = {
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
        broadcastNewNotification(userToEdit.id, notificationPayloadForSocket)
      } else if (currentUserRole === 2 && (userToEditRole !== 1)) {
      // TODO If the current user's role is 2 (manager) and the user to edit's role is not 1 (admin), allow the update
        const updatedUser = await userToEdit.update({ roleId })
        if (!updatedUser) {
          logError(req, MASSAGE.NO_UPDATE_USER)
          return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
        }
        logInfo(req, updatedUser)
        broadcastRoleChangeWS(roleId, userToEdit.id)
        const dbNotification = await models.Notification.create({
          title: 'Change Role',
          message: 'Quản trị viên đã cập nhật vai trò của bạn.'
        })
        const notificationRecipient = await models.NotificationRecipient.create({
          userId: userToEdit.id,
          notificationId: dbNotification.id,
          status: 0
        })

        const notificationPayloadForSocket = {
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
        broadcastNewNotification(userToEdit.id, notificationPayloadForSocket)
      }
    }

    return res.json(updatedUser)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_UPDATE_USER })
  }
}

/**
 * Updates the user's role and other details.
 *
 * @author Hien
 * @route PUT /:id
 */
router.put('/:id', isAuthenticated, checkUserPermission, checkAndUpdateUserRole)

/**
 * Deletes a user and all associated records.
 *
 * @author Hien
 * @route DELETE /:id
 * @param {string} req.params.id - The ID of the user to be deleted.
 * @returns {Promise<Object>} A success message if the user is deleted, otherwise an error message.
 * @throws {Error} If there is an error deleting the user or associated records.
 */
router.delete('/:id', isAuthenticated, checkUserPermission, async (req, res) => {
  try {
    const { id } = req.params
    // TODO Find the user by primary key
    const user = await models.User.findByPk(id)
    if (!user) {
      logError(req, MASSAGE.USER_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
    }
    // TODO Remove record associations from the previous Course_Progress table
    const enrollments = await models.Enrollment.findAll({ where: { userId: id } })
    const enrollmentIds = enrollments.map(enrollment => enrollment.id)
    await models.CourseProgress.destroy({ where: { enrollmentId: enrollmentIds } })

    // TODO Delete associated records in parallel
    await Promise.all([
      models.UserEnterExitExamRoom.destroy({ where: { userId: id } }),
      models.QuestionDiscussion.destroy({ where: { userId: id } }),
      models.UserAnswerHistory.destroy({ where: { userId: id } }),
      models.TempUserAnswer.destroy({ where: { userId: id } }),
      models.Enrollment.destroy({ where: { userId: id } }),
      models.NotificationRecipient.destroy({ where: { userId: id } })
    ])

    // TODO Delete the user
    await user.destroy()
    logInfo(req, MASSAGE.DELETE_USER_SUCCESS)
    res.json({ message: MASSAGE.DELETE_USER_SUCCESS })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_DELETE_USER })
  }
})

/**
 * Retrieves a user by their ID.
 *
 * @author Hien
 * @route GET /:id
 * @param {string} req.params.id - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user object if found.
 * @throws {Error} If there is an error retrieving the user or the user is not found.
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    // Find user with included group data
    const user = await models.User.findByPk(id, {
      include: [{
        model: models.Group,
        attributes: ['name']
      }]
    })
    logInfo(req, user)
    res.json(user)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND })
  }
})

// Cấu hình Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/avatars/')
    // Kiểm tra và tạo thư mục nếu không tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, 'user-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

router.post('/avatar/:id', isAuthenticated, checkUserPermission, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params
    const user = await models.User.findByPk(id)

    if (!user) {
      return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
    }
    if (user.avatar) {
      const oldAvatarPath = path.resolve(__dirname, user.avatar)
      if (fs.existsSync(oldAvatarPath)) {
        // delete old avatar
        fs.unlinkSync(oldAvatarPath)
      }
    }
    // Update new avatar
    user.avatar = `${req.file.filename}`
    await user.save()

    res.json({ avatar: user.avatar })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: 'Không thể tải lên avatar' })
  }
})

/**
 * Ensures the directory for lesson uploads exists, creating it if necessary.
 *
 * @author Hien
 * @file user.js
 */

// Define the directory path for lesson uploads
const dir = path.resolve(__dirname, '../uploads/avatars')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
  console.log('Directory created:', dir)
} else {
  console.log('Directory already exists:', dir)
}
module.exports = router
