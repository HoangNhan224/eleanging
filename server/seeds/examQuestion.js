const { fakerEN: faker } = require('@faker-js/faker')
const ExamQuestion = require('../models/examQuestion')
const Exam = require('../models/exam')
const Question = require('../models/question')

/**
 * Get all Exam IDs
 *
 * @returns {Promise<Array<number>>} An array of exam IDs.
 */
const getAllExamIds = async () => {
  const exams = await Exam.findAll()
  return exams.map(exam => exam.id)
}

/**
 * Get all Question IDs
 *
 * @returns {Promise<Array<number>>} An array of question IDs.
 */
const getAllQuestionIds = async () => {
  const questions = await Question.findAll()
  return questions.map(question => question.id)
}

/**
 * Generate sample exam question data, ensuring each exam has at least 10 unique questions.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of exam question objects.
 */
const generateExamQuestion = async () => {
  const allExamIds = await getAllExamIds()
  const allQuestionIds = await getAllQuestionIds()

  if (!allExamIds.length || !allQuestionIds.length) {
    console.warn('No exams or questions found. Skipping ExamQuestion generation.')
    return []
  }

  const examQuestions = []
  const usedPairs = new Map()

  for (const examId of allExamIds) {
    const availableQuestions = [...allQuestionIds]
    const examQuestionsForExam = []

    // Nếu là bài đặc biệt → lấy 20 câu, ngược lại lấy tối đa 100 câu
    const maxQuestions = examId === 1 ? 20 : Math.min(availableQuestions.length, 100)

    while (examQuestionsForExam.length < maxQuestions) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length)
      const questionId = availableQuestions.splice(randomIndex, 1)[0]

      if (!usedPairs.has(examId)) {
        usedPairs.set(examId, new Set())
      }
      if (!usedPairs.get(examId).has(questionId)) {
        usedPairs.get(examId).add(questionId)
        examQuestionsForExam.push({
          examId,
          questionId,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent()
        })
      }
    }
    examQuestions.push(...examQuestionsForExam)
  }

  return examQuestions
}

/**
 * Seed the exam questions table with sample data.
 *
 * It checks if the table is empty, and if so, populates the table with the generated data.
 *
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedExamQuestion = async () => {
  try {
    const count = await ExamQuestion.count()
    if (count === 0) {
      const examQuestions = await generateExamQuestion()
      if (examQuestions.length > 0) {
        await ExamQuestion.bulkCreate(examQuestions, { validate: true })
        console.log(`Successfully seeded ${examQuestions.length} ExamQuestion records.`)
      } else {
        console.log('No ExamQuestion data to seed.')
      }
    } else {
      console.log('ExamQuestion table is not empty.')
    }
  } catch (error) {
    console.error(`Failed to seed ExamQuestion data: ${error}`)
  }
}

module.exports = seedExamQuestion
