const { fakerEN: faker } = require('@faker-js/faker')
const Exam = require('../models/exam')
const Lession = require('../models/lession')
const CategoryExam = require('../models/category_exam')
const User = require('../models/user')
const Group = require('../models/group')
const Course = require('../models/course')
/**
 * Generate a random lesson ID.
 *
 * This function retrieves all lessons from the database, extracts their IDs,
 * and returns a randomly selected lesson ID.
 *
 * @author Canh
 * @returns {Promise<number>} A promise that resolves to a random lesson ID.
 */
const generateLessionId = async () => {
  const lessions = await Lession.findAll()
  const lessionIds = lessions.map(lession => lession.id)
  const randomIndex = Math.floor(Math.random() * lessionIds.length)
  const randomLessionId = lessionIds[randomIndex]
  return randomLessionId
}
/**
 * Generate a random category exam ID.
 *
 * This function retrieves all category exams from the database, extracts their IDs,
 * and returns a randomly selected category exam ID.
 *
 * @author Canh
 * @returns {Promise<number>} A promise that resolves to a random category exam ID.
 */
const generateCategoryExamId = async () => {
  const categoryExams = await CategoryExam.findAll()
  const categoryExamsIds = categoryExams.map(categoryExam => categoryExam.id)
  const randomIndex = Math.floor(Math.random() * categoryExamsIds.length)
  const randomCategoryExamId = categoryExamsIds[randomIndex]
  return randomCategoryExamId
}
/**
 * Generate a random user ID.
 *
 * This function retrieves all users from the database, extracts their IDs,
 * and returns a randomly selected user ID.
 *
 * @author Canh
 * @returns {Promise<number>} A promise that resolves to a random user ID.
 */
const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}
const examData = [
  {
    name: 'Midterm Exam',
    description: 'An exam held halfway through a term or semester, assessing the knowledge acquired up to that point.'
  },
  {
    name: 'Final Exam',
    description: 'An exam held at the end of a term or semester, covering all the material studied throughout the course.'
  },
  {
    name: 'Practice Exam',
    description: 'A mock exam designed to give students practice in preparation for the actual exam.'
  },
  {
    name: 'Diagnostic Exam',
    description: "An exam administered at the beginning of a course to assess the student's baseline knowledge and skills."
  },
  {
    name: 'Comprehensive Exam',
    description: "An exam that evaluates a student's overall understanding of a subject, typically covering a wide range of topics."
  },
  {
    name: 'Mock Exam',
    description: 'An exam designed to simulate the conditions of the actual exam, often used for practice purposes.'
  },
  {
    name: 'Oral Exam',
    description: 'An exam where students are assessed verbally by an examiner, typically used to evaluate communication skills and knowledge.'
  },
  {
    name: 'Open-Book Exam',
    description: 'An exam where students are allowed to refer to their textbooks, notes, or other materials during the test.'
  },
  {
    name: 'Closed-Book Exam',
    description: 'An exam where students are not permitted to refer to any materials during the test, requiring them to rely solely on memory and understanding.'
  },
  {
    name: 'Take-Home Exam',
    description: 'An exam that students can complete outside of class, often with an extended time frame, allowing them to use resources and materials.'
  }
]
/**
 * Generate sample exam data.
 *
 * This function generates an array of sample exam data, ensuring that each lesson-category exam pair is unique.
 * Each exam entry includes details such as category exam ID, lesson ID, name, description, duration, passing points,
 * creator ID, number of attempts, creation date, and update date.
 *
 * @author Canh
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of exam objects.
 */
const generateExams = async () => {
  const usedPairs = new Set()
  const exams = []

  // Lấy danh sách khóa học và nhóm
  const courses = await Course.findAll()
  const groups = await Group.findAll()

  // Tạo bài kiểm tra cho mỗi khóa học
  for (const course of courses) {
    const lessionId = await generateLessionId()
    const categoryExamId = await generateCategoryExamId()
    const pair = `${lessionId}-${categoryExamId}`

    if (!usedPairs.has(pair)) {
      const randomIndex = Math.floor(Math.random() * examData.length)
      const exam = examData[randomIndex]

      exams.push({
        categoryExamId,
        lessionId,
        courseId: course.id,
        groupId: null,
        name: exam.name,
        description: exam.description,
        durationInMinute: faker.datatype.number({ min: 1, max: 1 }),
        pointToPass: faker.datatype.number({ min: 0, max: 10 }),
        numberOfAttempt: faker.datatype.number({ min: 10, max: 20 }),
        createrId: await generateUserId(),
        answerVisible: faker.datatype.boolean(),
        numberOfQuestion: faker.datatype.number({ min: 15, max: 20 }),
        publicDate: faker.date.past(),
        publicStatus: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
      usedPairs.add(pair)
    }
  }

  // Tạo ít nhất 1 bài kiểm tra cho mỗi nhóm
  for (const group of groups) {
    const lessionId = await generateLessionId()
    const categoryExamId = await generateCategoryExamId()
    const pair = `${lessionId}-${categoryExamId}`

    if (!usedPairs.has(pair)) {
      const randomIndex = Math.floor(Math.random() * examData.length)
      const exam = examData[randomIndex]

      exams.push({
        categoryExamId,
        lessionId,
        courseId: null,
        groupId: group.id,
        name: exam.name,
        description: exam.description,
        durationInMinute: faker.datatype.number({ min: 1, max: 1 }),
        pointToPass: faker.datatype.number({ min: 0, max: 10 }),
        createrId: await generateUserId(),
        answerVisible: faker.datatype.boolean(),
        numberOfQuestion: faker.datatype.number({ min: 15, max: 20 }),
        publicDate: faker.date.past(),
        publicStatus: true,
        numberOfAttempt: faker.datatype.number({ min: 10, max: 20 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })

      usedPairs.add(pair)
    }
  }

  // Nếu chưa đủ 50 bài kiểm tra, tiếp tục tạo bài kiểm tra cho nhóm
  // while (exams.length < 50) {
  //   const lessionId = await generateLessionId()
  //   const categoryExamId = await generateCategoryExamId()
  //   const pair = `${lessionId}-${categoryExamId}`

  //   if (!usedPairs.has(pair)) {
  //     const randomIndex = Math.floor(Math.random() * examData.length)
  //     const exam = examData[randomIndex]

  //     const selectedGroup = groups[Math.floor(Math.random() * groups.length)]
  //     const groupId = selectedGroup ? selectedGroup.id : null

  //     exams.push({
  //       categoryExamId,
  //       lessionId,
  //       courseId: null,
  //       groupId,
  //       name: exam.name,
  //       description: exam.description,
  //       durationInMinute: faker.datatype.number({ min: 1, max: 1 }),
  //       pointToPass: faker.datatype.number({ min: 50, max: 100 }),
  //       createrId: await generateUserId(),
  //       numberOfAttempt: faker.datatype.number({ min: 1, max: 3 }),
  //       createdAt: faker.date.past(),
  //       updatedAt: faker.date.recent()
  //     })
  //     usedPairs.add(pair)
  //   }
  // }
  // return exams
  const groupExamCount = new Map()

  // Khởi tạo số lượng bài thi của mỗi nhóm là 0
  groups.forEach(group => groupExamCount.set(group.id, 0))

  while (exams.length < 50) {
    const lessionId = await generateLessionId()
    const categoryExamId = await generateCategoryExamId()
    const pair = `${lessionId}-${categoryExamId}`

    if (!usedPairs.has(pair)) {
      const randomIndex = Math.floor(Math.random() * examData.length)
      const exam = examData[randomIndex]

      // Ưu tiên nhóm có ít hơn 10 bài thi
      let selectedGroup = groups.find(group => (groupExamCount.get(group.id) || 0) < 10)

      // Nếu tất cả nhóm đều có ít nhất 10 bài, chọn ngẫu nhiên
      if (!selectedGroup) {
        selectedGroup = groups[Math.floor(Math.random() * groups.length)]
      }

      const groupId = selectedGroup ? selectedGroup.id : null

      exams.push({
        categoryExamId,
        lessionId,
        courseId: null,
        groupId,
        name: exam.name,
        description: exam.description,
        durationInMinute: faker.datatype.number({ min: 1, max: 1 }),
        pointToPass: faker.datatype.number({ min: 0, max: 10 }),
        createrId: await generateUserId(),
        answerVisible: faker.datatype.boolean(),
        numberOfQuestion: faker.datatype.number({ min: 15, max: 20 }),
        publicDate: faker.date.past(),
        publicStatus: true,
        numberOfAttempt: faker.datatype.number({ min: 10, max: 20 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })

      // Cập nhật số lượng bài thi của nhóm đó
      groupExamCount.set(groupId, (groupExamCount.get(groupId) || 0) + 1)

      usedPairs.add(pair)
    }
  }

  return exams
}

/**
 * Seed the exams table with sample data.
 *
 * This function seeds the exams table with sample data generated by the generateExams function.
 * It first checks if the table is empty, and if so, it populates the table with the generated data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedExams = async () => {
  try {
    // Check if the exams table is empty
    const count = await Exam.count()
    if (count === 0) {
      // If the table is empty, generate sample exams data
      const exams = await generateExams()
      // Bulk create the sample data
      await Exam.bulkCreate(exams, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Exam table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Exam data: ${error}`)
  }
}

module.exports = seedExams
