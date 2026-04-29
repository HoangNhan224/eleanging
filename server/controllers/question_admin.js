/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable brace-style */
const express = require('express')
const { models } = require('../models')
// const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const newExam = await createExam()
    const newQuestions = await createQuestions(req)
    const examQuestion = await linkExamQuestion(newExam, newQuestions)
    res.json({
      examQuestion
    })
  } catch (error) {
    res.json(error)
  }
})

module.exports = router
async function createQuestions (req) {
  const questionsData = []
  req.body.results.forEach((element) => {
    const { a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p } = getOptions(element)
    const type = getQuestionType(element)
    const answer = element.correct_response.join('::')
    const question = {
      content: beautifyText(element.prompt.question),
      instruction: 'Choose the best answer.',
      type,
      a,
      b,
      c,
      d,
      e,
      f,
      g,
      h,
      i,
      j,
      k,
      l,
      m,
      n,
      o,
      p,
      answer,
      explanation: element.prompt.explanation
    }
    questionsData.push(question)
  })
  return await models.Question.bulkCreate(questionsData)
}

function getQuestionType (element) {
  let type = 'SINGLE_CHOICE'
  if (element.assessment_type === 'multi-select') {
    type = 'MULTIPLE_CHOICE'
  }
  return type
}

function getOptions (element) {
  let a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p
  if (getAnswerAt(element, 0) !== undefined) {
    a = getAnswerAt(element, 0)
  }
  if (getAnswerAt(element, 1) !== undefined) {
    b = getAnswerAt(element, 1)
  }
  if (getAnswerAt(element, 2) !== undefined) {
    c = getAnswerAt(element, 2)
  }
  if (getAnswerAt(element, 3) !== undefined) {
    d = getAnswerAt(element, 3)
  }
  if (getAnswerAt(element, 4) !== undefined) {
    e = getAnswerAt(element, 4)
  }
  if (getAnswerAt(element, 5) !== undefined) {
    f = getAnswerAt(element, 5)
  }
  if (getAnswerAt(element, 6) !== undefined) {
    g = getAnswerAt(element, 6)
  }
  if (getAnswerAt(element, 7) !== undefined) {
    h = getAnswerAt(element, 7)
  }
  if (getAnswerAt(element, 8) !== undefined) {
    i = getAnswerAt(element, 8)
  }
  if (getAnswerAt(element, 9) !== undefined) {
    j = getAnswerAt(element, 9)
  }
  if (getAnswerAt(element, 10) !== undefined) {
    k = getAnswerAt(element, 10)
  }
  if (getAnswerAt(element, 11) !== undefined) {
    l = getAnswerAt(element, 11)
  }
  if (getAnswerAt(element, 12) !== undefined) {
    m = getAnswerAt(element, 12)
  }
  if (getAnswerAt(element, 13) !== undefined) {
    n = getAnswerAt(element, 13)
  }
  if (getAnswerAt(element, 14) !== undefined) {
    o = getAnswerAt(element, 14)
  }
  if (getAnswerAt(element, 15) !== undefined) {
    p = getAnswerAt(element, 15)
  }
  return { a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p }
}

async function createExam () {
  const exam = [{
    name: 'enter the new name here'
  }]
  return await models.Exam.bulkCreate(exam)
}

async function linkExamQuestion (exam, questions) {
  const data = []
  questions.forEach((q) => {
    const examQuestion = {
      examId: exam[0].dataValues.id,
      questionId: q.id
    }
    data.push(examQuestion)
  })
  return await models.ExamQuestion.bulkCreate(data)
}

function getAnswerAt (element, index) {
  return element.prompt.answers[index]
}
function removeHTMLTag (string) {
  return string.replace(/<[^>]*>?/gm, '')
}

function beautifyText (string) {
  string = string.replace(/\s*([,.!?:;]+)(?!\s*$)\s*/g, '$1 ')
  string = MSNotice(string)
  string = string.replace(/✑/g, '<br>✑')
  string = string.replace(/Solution:/g, '<br>Solution:')
  string = string.replace(/eact. js/g, 'eact.js')
  string = string.replace(/. NET/g, '.NET')
  string = string.replace(/Node. js/g, 'Node.js')
  string = string.replace(/. PNG/g, '.PNG')
  string = string.replace(/. jpg/g, '.jpg')
  string = string.replace('https: //img-c. udemycdn. com', 'https://img-c.udemycdn.com')
  return string
}

function MSNotice (string) {
  const notice = 'Note: This question is part of a series of questions that present the same scenario. Each question in the series contains a unique solution that might meet the stated goals. Some question sets might have more than one correct solution, while others might not have a correct solution. After you answer a question in this section, you will NOT be able to return to it. As a result, these questions will not appear in the review screen.'
  return string.replace(notice, notice + '<br><br>')
}
