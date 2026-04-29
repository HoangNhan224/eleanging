/* eslint-disable no-unused-vars */
const users = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    description: 'Test user',
    email: 'john.doe@example.com',
    gender: 'male',
    age: 30,
    username: 'johndoe',
    password: 'password',
    roleId: 1,
    refreshToken: 'refreshToken1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    description: 'Test user',
    email: 'jane.doe@example.com',
    gender: 'female',
    age: 28,
    username: 'janedoe',
    password: 'password',
    roleId: 2,
    refreshToken: 'refreshToken2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    firstName: 'Alice',
    lastName: 'Smith',
    description: 'Test user',
    email: 'alice.smith@example.com',
    gender: 'female',
    age: 35,
    username: 'alicesmith',
    password: 'password',
    roleId: 1,
    refreshToken: 'refreshToken3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    firstName: 'Bob',
    lastName: 'Johnson',
    description: 'Test user',
    email: 'bob.johnson@example.com',
    gender: 'male',
    age: 40,
    username: 'bobjohnson',
    password: 'password',
    roleId: 2,
    refreshToken: 'refreshToken4',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    firstName: 'Charlie',
    lastName: 'Brown',
    description: 'Test user',
    email: 'charlie.brown@example.com',
    gender: 'male',
    age: 45,
    username: 'charliebrown',
    password: 'password',
    roleId: 1,
    refreshToken: 'refreshToken5',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const categoryCourses = [
  { id: 1, name: 'front-end', description: 'This is category 1', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'back-end', description: 'This is category 2', createdAt: new Date(), updatedAt: new Date() }
]

const courses = [
  { id: 1, name: 'Reactjs', description: 'This is course reactjs', categoryId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Nodejs', description: 'This is course nodejs', categoryId: 2, createdAt: new Date(), updatedAt: new Date() }
]

const categoryLessions = [
  { id: 1, name: 'Category Lession 1', description: 'This is category lession 1', courseId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Category Lession 2', description: 'This is category lession 2', courseId: 1, createdAt: new Date(), updatedAt: new Date() }
]

const lessions = [
  { id: 1, name: 'Lession 1', description: 'This is lession 1', lessionCategoryId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Lession 2', description: 'This is lession 2', lessionCategoryId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Lession 3', description: 'This is lession 3', lessionCategoryId: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Lession 4', description: 'This is lession 4', lessionCategoryId: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: 'Lession 5', description: 'This is lession 5', lessionCategoryId: 2, createdAt: new Date(), updatedAt: new Date() }
]

//   const myCourses = [
//     {id: 1,name: 'Canh',userId: 1,courseId: 1,progress:0,createdAt: new Date(),updatedAt: new Date()},
//     {id: 2,name: 'Hien',userId: 2,courseId: 2,progress:0,createdAt: new Date(),updatedAt: new Date()}
//   ]

const lessionProgresses = [
  { id: 1, userId: 1, lessionId: 1, completed: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, userId: 1, lessionId: 2, completed: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, userId: 1, lessionId: 3, completed: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, userId: 2, lessionId: 2, completed: true, createdAt: new Date(), updatedAt: new Date() }
]
// TINH SO LUOONG BAI HOC TRONG 1 KHOA HOC
// tim course theo course category
const reactCourses = courses.filter(course => course.categoryId === 1)
const reactCourseIds = reactCourses.map(course => course.id)
console.log('course', reactCourseIds)
// tim lession category theo course
const reactCategoryLessions = categoryLessions.filter(lessioncate => reactCourseIds.includes(lessioncate.courseId))
const reactCategoryLessionIds = reactCategoryLessions.map(lession => lession.id)
console.log('lession category', reactCategoryLessionIds)
// tim lession theo lession category
const reactLessions = lessions.filter(lession => reactCategoryLessionIds.includes(lession.lessionCategoryId))
const reactLessionNames = reactLessions.map(lession => lession.name)
console.log('co so luong bai hoc la', reactLessionNames.length)
console.log('lession', reactLessionNames)

// id ng dug
const userId = 2

// progress cua ng dung do
const userLessionProgresses = lessionProgresses.filter(progress => progress.userId === userId)
const done = userLessionProgresses.length
console.log('so bai hoc da hoan thanh', done)
// Tính phần trăm bài học người dùng đã hoàn thành
const percentUserCompleted = (done / reactLessionNames.length) * 100

console.log(`Người dùng ${userId} đã hoàn thành ${percentUserCompleted}% khóa học.`)
