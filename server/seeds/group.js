const { fakerEN: faker } = require('@faker-js/faker')
const Group = require('../models/group')

const groups = [
  {
    name: 'Part time',
    description: 'Part time',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'Thuc Tap',
    description: 'Thuc Tap',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'AIBPO',
    description: 'AIBPO',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'AT',
    description: 'AT',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'Content',
    description: 'Content',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'Daichi',
    description: 'Daichi',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'GIKEN',
    description: 'GIKEN',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'HanBaiVN',
    description: 'HanBaiVN',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'Nexres',
    description: 'Nexres',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'Nextech',
    description: 'Nextech',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'NN_WebBoki',
    description: 'NN_WebBoki',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'SMB_VJOS',
    description: 'SMB_VJOS',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'SMB_会計王',
    description: 'SMB_会計王',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'SMB_給料王',
    description: 'SMB_給料王',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'TF',
    description: 'TF',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: '国内事業部-FFVN',
    description: '国内事業部-FFVN',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: '国内事業部-WACA',
    description: '国内事業部-WACA',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: '管理グループ',
    description: '管理グループ',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }

]

/**
 * Seed the groups table with sample data.
 *
 * This function seeds the groups table with sample data. It first checks if the table is empty,
 * and if so, it populates the table with the provided sample data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedGroups = async () => {
  try {
    // Check if the groups table is empty
    const count = await Group.count()
    if (count === 0) {
      // If the table is empty, bulk create the sample data
      await Group.bulkCreate(groups, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Groups table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Groups data: ${error}`)
  }
}

module.exports = seedGroups
