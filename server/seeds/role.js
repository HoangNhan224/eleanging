const { fakerEN: faker } = require('@faker-js/faker')
const Role = require('../models/role')

const roles = [
  {
    name: 'R1',
    description: 'ADMIN',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'R2',
    description: 'MANAGER',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'R3',
    description: 'USER',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
]

/**
 * Seed the roles table with sample data.
 *
 * This function seeds the roles table with sample data. It first checks if the table is empty,
 * and if so, it populates the table with the provided sample data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedRoles = async () => {
  try {
    // Check if the roles table is empty
    const count = await Role.count()
    if (count === 0) {
      // If the table is empty, bulk create the sample data
      await Role.bulkCreate(roles, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Roles table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Roles data: ${error}`)
  }
}

module.exports = seedRoles
