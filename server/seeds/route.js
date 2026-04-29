const { fakerEN: faker } = require('@faker-js/faker')
const Route = require('../models/route')

const routes = [
  {
    url: '/api/v1/role',
    method: 'GET',
    description: 'Get All Roles',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/role',
    method: 'POST',
    description: 'Create a Role',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/role',
    method: 'PUT',
    description: 'Update a Role',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/users',
    method: 'PUT',
    description: 'Update a User',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/users',
    method: 'DELETE',
    description: 'Delete a User',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
]

/**
 * Seed the routes table with sample data.
 *
 * This function seeds the routes table with sample data. It first checks if the table is empty,
 * and if so, it populates the table with the provided sample data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedRoutes = async () => {
  try {
    // Check if the routes table is empty
    const count = await Route.count()
    if (count === 0) {
      // If the table is empty, bulk create the sample data
      await Route.bulkCreate(routes, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Routes table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Routes data: ${error}`)
  }
}

module.exports = seedRoutes
