const { models } = require('../models')
const { verifyToken, decodeToken } = require('../utils')

const isAuthenticated = async (req, res, next) => {
  let userId = null
  if (req.headers.authorization) {
    const [, accessTokenFromHeader] = req.headers.authorization.split(' ')
    if (accessTokenFromHeader) {
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
      const verified = await verifyToken(
        accessTokenFromHeader,
        accessTokenSecret
      )
      if (verified) {
        userId = verified.payload.id
        req.user = verified.payload
      }
    }
    if (userId) {
      const kq = await models.User.findOne({
        where: {
          id: userId
        }
      })
      if (kq) return next()
    }
  }
  return res.status(401).json({
    code: 401,
    message: 'Unauthorized'
  })
}

const isAuthenticatedWithRoleCheck = async (req, res, next) => {
  if (req.headers.authorization) {
    const [, accessTokenFromHeader] = req.headers.authorization.split(' ')
    if (accessTokenFromHeader) {
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

      // Check if the token is valid
      const verified = await verifyToken(accessTokenFromHeader, accessTokenSecret)

      // If the token is expired, decode the token to check roleId
      if (!verified) {
        const decoded = await decodeToken(accessTokenFromHeader, accessTokenSecret)
        if (decoded && decoded.payload) {
          const kq = await models.User.findOne({
            where: { id: decoded.payload.id },
            include: [models.Role]
          })
          if (kq && decoded.payload.roleId !== kq.roleId) {
            return res.status(404).json({
              code: 404,
              message: 'RoleChanged'
            })
          }
          if (kq && decoded.payload.roleVersion !== kq.Role.roleVersion) {
            return res.status(404).json({
              code: 404,
              message: 'PermissionChanged'
            })
          }
        }
        return res.status(401).json({
          code: 401,
          message: 'Unauthorized'
        })
      }

      req.user = verified.payload
      const userWithRole = await models.User.findOne({
        where: { id: verified.payload.id },
        include: [models.Role]
      })

      if (!userWithRole) {
        return res.status(401).json({
          code: 401,
          message: 'Unauthorized'
        })
      }
      // Check the user's roleId
      if (verified.payload.roleId !== userWithRole.roleId) {
        return res.status(404).json({
          code: 404,
          message: 'RoleChanged'
        })
      }

      // Check the roleVersion of the role
      if (verified.payload.roleVersion !== userWithRole.Role.roleVersion) {
        return res.status(404).json({
          code: 404,
          message: 'PermissionChanged'
        })
      }

      return next()
    }
  }
  return res.status(401).json({
    code: 401,
    message: 'Unauthorized'
  })
}
/**
 * The middleware checkUserPermission ensures that only logged-in users with appropriate permissions can access certain routes in the application.
 * In this middleware, the Request Properties (originalUrl and method) will be compared with the list of permissions from the decoded JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @author Hien
 */
const checkUserPermission = (req, res, next) => {
  if (req.user) {
    const permissions = req.user.GroupWithRoles.Permissions
    let currentUrl = req.originalUrl.split('?')[0].toLowerCase()
    if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.slice(0, -1)
    }
    const method = req.method.toUpperCase()
    const matchUrl = (pattern, url) => {
      let normalizedPattern = pattern.toLowerCase()
      let normalizedUrl = url.toLowerCase()

      if (normalizedPattern.endsWith('/')) {
        normalizedPattern = normalizedPattern.slice(0, -1)
      }
      if (normalizedUrl.endsWith('/')) {
        normalizedUrl = normalizedUrl.slice(0, -1)
      }

      const patternParts = normalizedPattern.split('/')
      const urlParts = normalizedUrl.split('/')

      if (patternParts.length !== urlParts.length) {
        return false
      }
      return patternParts.every((part, index) => {
        return part.startsWith(':') || part === urlParts[index]
      })
    }

    const hasPermission = permissions.some(permission => {
      const permMethod = permission.method.toUpperCase()
      if (permMethod === 'ANY') {
        return currentUrl.startsWith(permission.url.toLowerCase())
      } else {
        return matchUrl(permission.url, currentUrl) && permMethod === method
      }
    })

    if (hasPermission) {
      next()
    } else {
      return res.status(403).json({
        code: 403,
        message: 'User does not have the required permission'
      })
    }
  } else {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    })
  }
}

module.exports = {
  isAuthenticated,
  checkUserPermission,
  isAuthenticatedWithRoleCheck
}
