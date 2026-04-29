const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')
const { saveAllRoutes, createPermissionForAllRoutes } = require('./middlewares/routePermissions')
require('./passport')
const initDataController = require('./controllers/init-data')
const examController = require('./controllers/exam')
const questionAdminController = require('./controllers/question_admin')
const questionController = require('./controllers/question')
const authController = require('./controllers/auth')
const roleController = require('./controllers/role')
const permissionController = require('./controllers/permission')
const userController = require('./controllers/user')
const roleToPermissionController = require('./controllers/role_to_permission')
const routeController = require('./controllers/route')
const courseController = require('./controllers/course')
const learningController = require('./controllers/learning')
const categoryCourseController = require('./controllers/category_course') // categorycourse
const lessionController = require('./controllers/lession')
const dashboardController = require('./controllers/dashboard')
const enrollmentsController = require('./controllers/enrollment')
const groupsController = require('./controllers/group')
const notificationController = require('./controllers/notification')
const categoryLessionController = require('./controllers/category_lession') // categorycourse
const seedDatabase = require('./seeds/index')
const { API_PREFIX } = require('./utils')
const cron = require('node-cron')
const { Op } = require('sequelize')
const { models } = require('./models')

const app = express()

app.set('trust proxy', true)

// TODO: apply redis later
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')
//   res.setHeader('Access-Control-Allow-Credentials', true)
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200)
//   }
//   next()
// })
app.use(cors({
  origin: ['http://localhost:3000', 'http://172.16.0.143:3000'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))

app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(`${API_PREFIX}/auth`, authController)
app.use(`${API_PREFIX}/init-data`, initDataController)
app.use(`${API_PREFIX}/exams`, examController)
app.use(`${API_PREFIX}/question_admin`, questionAdminController)
app.use(`${API_PREFIX}/questions`, questionController)
app.use(`${API_PREFIX}/courses`, courseController)
app.use(`${API_PREFIX}/learn`, learningController)
app.use(`${API_PREFIX}/lessions`, lessionController)
app.use(`${API_PREFIX}/dashboard`, dashboardController)
app.use(`${API_PREFIX}/roles`, roleController)
app.use(`${API_PREFIX}/permissions`, permissionController)
app.use(`${API_PREFIX}/users`, userController)
app.use(`${API_PREFIX}/role_to_permission`, roleToPermissionController)
app.use(`${API_PREFIX}/routes`, routeController)
app.use(`${API_PREFIX}/enrollments`, enrollmentsController)
app.use(`${API_PREFIX}/groups`, groupsController)
app.use(`${API_PREFIX}/notifications`, notificationController)
app.use(`${API_PREFIX}/categorycourse`, categoryCourseController)
app.use(`${API_PREFIX}/categorylession`, categoryLessionController)

// cron job to remove expired token
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date()
    await models.User.update(
      { refreshToken: null, expiredToken: null },
      {
        where: {
          expiredToken: {
            [Op.lt]: now
          }
        }
      }
    )
  } catch (error) {
    console.error('Error when cron job:', error)
  }
})

async function startServer () {
  try {
    await sequelize.sync()
    console.log('Database synchronized successfully')
    await seedDatabase()
    console.log('Data seeded successfully')
    await saveAllRoutes(app)
    console.log('All routes saved successfully')
    await createPermissionForAllRoutes()
    console.log('All permissions saved successfully')
    app.listen(process.env.PORT, () => {
      console.log('Server is running')
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()
