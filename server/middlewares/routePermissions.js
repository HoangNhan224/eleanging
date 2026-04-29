const expressListEndpoints = require('express-list-endpoints')
const { API_PREFIX } = require('../utils')
const Route = require('../models/route')
const Permission = require('../models/permission')
const Role = require('../models/role')
const RoleToPermission = require('../models/role_to_permission')
const Sequelize = require('sequelize')

/**
 * Saves all relevant routes from the Express app to the database.
 * @param {Object} app - The Express application instance.
 * @author Hien
 */
async function saveAllRoutes (app) {
  const endpoints = expressListEndpoints(app)
  const relevantPaths = [
    `${API_PREFIX}/lessions`,
    `${API_PREFIX}/roles`,
    `${API_PREFIX}/users`,
    `${API_PREFIX}/courses`
  ]

  for (const endpoint of endpoints) {
    if (relevantPaths.some(path => endpoint.path.startsWith(path))) {
      for (const method of endpoint.methods) {
        if (method !== 'GET') { // Ignore GET methods
          try {
            await Route.findOrCreate({
              where: { url: endpoint.path, method },
              defaults: { description: '' }
            })
          } catch (error) {
            console.error(`Error saving route ${endpoint.path} [${method}]:`, error)
          }
        }
      }
    }
  }

  // Save ANY routes
  for (const path of relevantPaths) {
    try {
      await Route.findOrCreate({
        where: { url: path, method: 'ANY' },
        defaults: { description: '' }
      })
    } catch (error) {
      console.error(`Error saving route ${path} [ANY]:`, error)
    }
  }

  console.log('All routes have been recorded in the database.')
}
/**
 * Creates permissions for all routes and assigns them to the admin role.
 * @author Hien
 */
async function createPermissionForAllRoutes () {
  try {
    const routes = await Route.findAll()
    for (const route of routes) {
      if (route.method === 'ANY') {
        continue
      }

      try {
        const [permission] = await Permission.findOrCreate({
          where: { method: route.method, url: route.url },
          defaults: {
            name: `${route.method} ${route.url}`,
            description: `Permission for ${route.method} ${route.url}`
          }
        })

        // Find admin role
        const adminRole = await Role.findOne({
          where: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('description')),
            'admin'
          )
        })

        if (adminRole) {
          // Assign this new permission to the admin role
          await RoleToPermission.findOrCreate({
            where: { roleId: adminRole.id, permissionId: permission.id }
          })
        }
      } catch (error) {
        console.error(`Error creating permission for route ${route.url} [${route.method}]:`, error)
      }
    }
  } catch (error) {
    console.error('Error fetching routes:', error)
  }
}

module.exports = {
  saveAllRoutes,
  createPermissionForAllRoutes
}
