const sequelize = require('./init')
const Exam = require('./exam')
const Question = require('./question')
const User = require('./user')
const UserAnswerHistory = require('./userAnswerHistory')
const ExamQuestion = require('./examQuestion')
const UserEnterExitExamRoom = require('./userEnterExitExamRoom')
const TempUserAnswer = require('./tempUserAnswer')
const QuestionDiscussion = require('./questionDiscussion')
const CategoryExam = require('./category_exam')
const Course = require('./course')
const CourseProgress = require('./course_progress')
const Enrollment = require('./enrollments')
const Lession = require('./lession')
const CategoryLession = require('./category_lession')
const Permission = require('./permission')
const Role = require('./role')
const RoleToPermission = require('./role_to_permission')
const CategoryCourse = require('./category_course')
const Group = require('./group')
const Route = require('./route')
const Notification = require('./notification')
const NotificationRecipient = require('./notification_recipient')
const Banner = require('./banner')

Exam.belongsTo(CategoryExam, { foreignKey: 'categoryExamId' })
CategoryExam.hasMany(Exam, { foreignKey: 'categoryExamId' })

Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'courses' })
Course.hasOne(Exam, { foreignKey: 'courseId', as: 'exams' })

Exam.belongsTo(Group, { foreignKey: 'groupId', as: 'groups' })
Group.hasMany(Exam, { foreignKey: 'groupId', as: 'exams' })

Enrollment.belongsTo(User, { foreignKey: 'userId' })
Enrollment.belongsTo(Course, { foreignKey: 'courseId' })

User.belongsToMany(Course, { through: Enrollment, foreignKey: 'userId' })
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId' })

Course.hasMany(CategoryLession, { foreignKey: 'courseId' })
CategoryLession.belongsTo(Course, { foreignKey: 'courseId' })

CategoryLession.hasMany(Lession, { foreignKey: 'lessionCategoryId' })
Lession.belongsTo(CategoryLession, { foreignKey: 'lessionCategoryId' })

CourseProgress.belongsTo(Enrollment, { foreignKey: 'enrollmentId' })
CourseProgress.belongsTo(Lession, { foreignKey: 'lessionId' })

Enrollment.belongsToMany(Lession, { through: CourseProgress, foreignKey: 'enrollmentId' })
Lession.belongsToMany(Enrollment, { through: CourseProgress, foreignKey: 'lessionId' })

Role.hasMany(User, { foreignKey: 'roleId' })
User.belongsTo(Role, { foreignKey: 'roleId' })

Group.hasMany(User, { foreignKey: 'groupId' })
User.belongsTo(Group, { foreignKey: 'groupId' })

RoleToPermission.belongsTo(Role, { foreignKey: 'roleId' })
RoleToPermission.belongsTo(Permission, { foreignKey: 'permissionId' })

Role.belongsToMany(Permission, { through: RoleToPermission, foreignKey: 'roleId' })
Permission.belongsToMany(Role, { through: RoleToPermission, foreignKey: 'permissionId' })

NotificationRecipient.belongsTo(User, { foreignKey: 'userId' })
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notificationId' })

User.belongsToMany(Notification, { through: NotificationRecipient, foreignKey: 'userId' })
Notification.belongsToMany(User, { through: NotificationRecipient, foreignKey: 'notificationId' })

UserAnswerHistory.belongsTo(User, { foreignKey: 'userId' })
UserAnswerHistory.belongsTo(Exam, { foreignKey: 'examId' })

ExamQuestion.belongsTo(Exam, { foreignKey: 'examId' })
ExamQuestion.belongsTo(Question, { foreignKey: 'questionId' })

Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: 'examId' })
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: 'questionId' })

QuestionDiscussion.belongsTo(User, { foreignKey: 'userId' })
QuestionDiscussion.belongsTo(Question, { foreignKey: 'questionId' })

User.belongsToMany(Question, { through: { model: QuestionDiscussion, unique: false }, foreignKey: 'userId' })
Question.belongsToMany(User, { through: { model: QuestionDiscussion, unique: false }, foreignKey: 'questionId' })

UserEnterExitExamRoom.belongsTo(User, { foreignKey: 'userId' })
UserEnterExitExamRoom.belongsTo(Exam, { foreignKey: 'examId' })

User.belongsToMany(Exam, { through: { model: UserEnterExitExamRoom, unique: false }, foreignKey: 'userId' })
Exam.belongsToMany(User, { through: { model: UserEnterExitExamRoom, unique: false }, foreignKey: 'examId' })

UserAnswerHistory.belongsTo(User, { foreignKey: 'userId' })
UserAnswerHistory.belongsTo(Question, { foreignKey: 'questionId' })
UserAnswerHistory.belongsTo(Exam, { foreignKey: 'examId' })

User.hasMany(UserAnswerHistory, { foreignKey: 'userId' })
Question.hasMany(UserAnswerHistory, { foreignKey: 'questionId' })
Exam.hasMany(UserAnswerHistory, { foreignKey: 'examId' })

TempUserAnswer.belongsTo(User, { foreignKey: 'userId' })
TempUserAnswer.belongsTo(Question, { foreignKey: 'questionId' })
TempUserAnswer.belongsTo(Exam, { foreignKey: 'examId' })

User.hasMany(TempUserAnswer, { foreignKey: 'userId' })
Question.hasMany(TempUserAnswer, { foreignKey: 'questionId' })
Exam.hasMany(TempUserAnswer, { foreignKey: 'examId' })

Course.belongsTo(CategoryCourse, { foreignKey: 'categoryCourseId' })
CategoryCourse.hasMany(Course, { foreignKey: 'categoryCourseId' })

Question.belongsTo(Course, { foreignKey: 'target_id', as: 'course' })
Course.hasMany(Question, { foreignKey: 'target_id', as: 'questions' })

Question.belongsTo(Group, { foreignKey: 'target_id', as: 'group' })
Group.hasMany(Question, { foreignKey: 'target_id', as: 'questions' })

Banner.belongsTo(Exam, { foreignKey: 'examId' })
Exam.hasMany(Banner, { foreignKey: 'examId' })
module.exports = {
  sequelize,
  models: {
    Exam,
    Question,
    User,
    Notification,
    NotificationRecipient,
    UserAnswerHistory,
    ExamQuestion,
    UserEnterExitExamRoom,
    TempUserAnswer,
    QuestionDiscussion,
    CategoryExam,
    CategoryCourse,
    Course,
    Lession,
    Permission,
    Role,
    RoleToPermission,
    Route,
    CategoryLession,
    CourseProgress,
    Enrollment,
    Group,
    Banner
  }
}
