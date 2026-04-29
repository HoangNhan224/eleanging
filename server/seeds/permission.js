const { fakerEN: faker } = require('@faker-js/faker')
const Permission = require('../models/permission')

const permissions = [
  {
    name: 'P1',
    description: 'Delete User',
    method: 'DELETE',
    url: '/api/v1/users',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'P2',
    description: 'View Role',
    method: 'GET',
    url: '/api/v1/role',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'P3',
    description: 'Edit Profile',
    method: 'PUT',
    url: '/api/v1/users',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
]
/**
 * Seed the permissions table with sample data.
 *
 * This function seeds the permissions table with sample data. It first checks if the table is empty,
 * and if so, it populates the table with the provided sample data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedPermissions = async () => {
  try {
    // Check if the permissions table is empty
    const count = await Permission.count()
    if (count === 0) {
      // If the table is empty, bulk create the sample data
      await Permission.bulkCreate(permissions, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Permission table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Permission data: ${error}`)
  }
}

module.exports = seedPermissions
