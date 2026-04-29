/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const CategoryLession = require('../models/category_lession')
const Lession = require('../models/lession')
const User = require('../models/user')

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
  // Retrieve all users from the database
  const users = await User.findAll()
  // Extract user IDs from the retrieved users
  const userIds = users.map(user => user.id)
  // Generate a random index to select a user ID
  const randomIndex = Math.floor(Math.random() * userIds.length)
  // Select and return the random user ID
  const randomUserId = userIds[randomIndex]
  return randomUserId
}
const titleExamples = [
  'Cách đăng ký tài khoản trên Portal WACA', 'Hướng dẫn kích hoạt phần mềm sau khi đăng ký',
  'Các phương thức đăng nhập Portal WACA', 'Quản lý thông tin tài khoản trên Portal',
  'Giao diện và cách sử dụng phần mềm trên WACA', 'Tùy chỉnh và cập nhật thông tin phần mềm',

  'Hướng dẫn khai báo thông tin hợp tác xã', 'Đăng ký số dư đầu kỳ trong WACA',
  'Cách nhập đối tượng góp vốn vào hệ thống', 'Quản lý dữ liệu góp vốn bằng Excel',
  'Đăng ký số dư khách hàng và nhà cung cấp', 'Quản lý tín dụng nội bộ trên WACA',

  'Cách khai báo vật tư hàng hóa đầu kỳ', 'Quản lý danh mục vật tư hàng hóa',
  'Hướng dẫn đăng ký số dư đầu kỳ thành phẩm', 'Xử lý biến động hàng tồn kho',
  'Tạo báo cáo tồn kho trên WACA', 'Phân tích dữ liệu tồn kho và dự báo',

  'Đăng ký tài sản cố định trong WACA', 'Quản lý hao mòn tài sản cố định',
  'Đăng ký và quản lý chi phí trả trước', 'Phân bổ chi phí trả trước trong kỳ kế toán',
  'Đăng ký và theo dõi chi phí sản xuất dở dang', 'Quản lý và phân bổ chi phí sản xuất',

  'Đăng ký và theo dõi các khoản phải thu', 'Quản lý các khoản phải trả nhà cung cấp',
  'Theo dõi lợi nhuận chưa phân phối', 'Quản lý quỹ khen thưởng và phúc lợi',
  'Tạo báo cáo tài chính trên WACA', 'Phân tích và trình bày báo cáo tài chính',

  'Giới thiệu về hệ thống FaceFarm', 'Tính năng và lợi ích của FaceFarm',
  'Cách tạo và đăng ký tài khoản', 'Xác thực và kích hoạt tài khoản FaceFarm',
  'Giao diện chính của FaceFarm', 'Cấu hình thông tin đơn vị sản xuất',

  'Cách ghi chép nhật ký sản xuất', 'Sử dụng mẫu nhật ký để nhập liệu',
  'Theo dõi nhật ký sản xuất', 'Cập nhật và chỉnh sửa nhật ký',
  'Sử dụng công cụ thống kê của FaceFarm', 'Xuất báo cáo từ nhật ký sản xuất',

  'Nhập liệu và quản lý thông tin nông dược', 'Tra cứu nhanh nông dược trong FaceFarm',
  'Cách nhập liệu và quản lý thông tin phân bón', 'Theo dõi tình trạng tồn kho phân bón',
  'Dự toán chi phí và lượng sử dụng', 'Phân tích hiệu quả sử dụng nông dược và phân bón',

  'Cách thêm và quản lý thông tin nhân công', 'Phân quyền và phân công công việc',
  'Lập kế hoạch và phân công công việc', 'Theo dõi tiến độ và báo cáo công việc',
  'Tối ưu hóa quy trình sản xuất thông qua FaceFarm', 'Sử dụng dữ liệu để cải thiện năng suất',

  'Cài đặt và sử dụng ứng dụng ghi chép nhanh', 'Đồng bộ hóa dữ liệu với hệ thống FaceFarm',
  'Tạo mã QR và truy xuất nguồn gốc sản phẩm', 'Đăng tin bán hàng lên sàn thương mại điện tử',
  'Tích hợp FaceFarm với các hệ thống khác', 'Tối ưu hóa chiến lược kinh doanh qua FaceFarm'
]

const descriptionExamples = [
  'Hướng dẫn chi tiết từng bước để tạo tài khoản trên Portal WACA, giúp người dùng dễ dàng tiếp cận và sử dụng các dịch vụ của hệ thống.',
  'Quy trình kích hoạt phần mềm WACA sau khi đã hoàn tất đăng ký tài khoản, đảm bảo bạn có thể bắt đầu sử dụng ngay.',
  'Tổng quan về các phương thức đăng nhập trên Portal WACA, bao gồm đăng nhập bằng tài khoản, email, và các dịch vụ khác.',
  'Hướng dẫn quản lý và cập nhật thông tin tài khoản của bạn trên Portal WACA, đảm bảo dữ liệu luôn được cập nhật chính xác.',
  'Giới thiệu về giao diện chính của phần mềm WACA và cách sử dụng các chức năng cơ bản để quản lý hoạt động của bạn.',
  'Hướng dẫn tùy chỉnh và cập nhật thông tin phần mềm trên WACA để đáp ứng nhu cầu sử dụng cụ thể của bạn.',

  'Hướng dẫn khai báo thông tin hợp tác xã trên hệ thống WACA một cách chính xác và đầy đủ.',
  'Cách đăng ký số dư đầu kỳ trong WACA để bắt đầu quản lý tài chính của hợp tác xã.',
  'Hướng dẫn chi tiết cách nhập đối tượng góp vốn vào hệ thống để quản lý nguồn vốn một cách hiệu quả.',
  'Sử dụng Excel để quản lý và theo dõi dữ liệu góp vốn trên WACA, giúp tăng tính chính xác và tiết kiệm thời gian.',
  'Hướng dẫn đăng ký và quản lý số dư khách hàng và nhà cung cấp trong hệ thống WACA.',
  'Quy trình quản lý tín dụng nội bộ trên WACA, từ việc khai báo đến theo dõi tình hình sử dụng tín dụng.',

  'Cách khai báo vật tư hàng hóa đầu kỳ để đảm bảo dữ liệu tồn kho chính xác từ đầu kỳ kế toán.',
  'Hướng dẫn quản lý danh mục vật tư hàng hóa trong WACA, giúp tối ưu hóa quản lý tồn kho.',
  'Cách đăng ký số dư đầu kỳ thành phẩm và theo dõi tồn kho chính xác.',
  'Hướng dẫn xử lý biến động hàng tồn kho trên WACA để đảm bảo số liệu tồn kho luôn được cập nhật.',
  'Tạo báo cáo tồn kho chi tiết trên WACA để theo dõi và phân tích tình trạng tồn kho.',
  'Hướng dẫn phân tích dữ liệu tồn kho và dự báo nhu cầu dựa trên các số liệu có sẵn trong hệ thống.',

  'Hướng dẫn đăng ký tài sản cố định trong WACA để quản lý tài sản một cách chính xác.',
  'Quản lý hao mòn tài sản cố định, từ việc ghi nhận đến theo dõi quá trình khấu hao tài sản.',
  'Hướng dẫn đăng ký và quản lý chi phí trả trước trong hệ thống WACA, đảm bảo phân bổ chi phí hợp lý.',
  'Phân bổ chi phí trả trước trong kỳ kế toán để đảm bảo số liệu kế toán chính xác.',
  'Hướng dẫn đăng ký và theo dõi chi phí sản xuất dở dang trong quá trình sản xuất.',
  'Quản lý và phân bổ chi phí sản xuất để tối ưu hóa hiệu quả sản xuất và tiết kiệm chi phí.',

  'Cách đăng ký và theo dõi các khoản phải thu để quản lý công nợ khách hàng hiệu quả.',
  'Quản lý các khoản phải trả nhà cung cấp, từ việc ghi nhận đến thanh toán công nợ.',
  'Theo dõi lợi nhuận chưa phân phối để có cái nhìn tổng quan về tình hình tài chính.',
  'Hướng dẫn quản lý quỹ khen thưởng và phúc lợi, đảm bảo phúc lợi cho nhân viên.',
  'Tạo báo cáo tài chính chi tiết trên WACA để phân tích tình hình tài chính của doanh nghiệp.',
  'Hướng dẫn phân tích và trình bày báo cáo tài chính, giúp quản lý và nhà đầu tư hiểu rõ hơn về hiệu quả kinh doanh.',

  'Giới thiệu về hệ thống FaceFarm và các tính năng nổi bật giúp quản lý trang trại hiệu quả.',
  'Tổng quan về các tính năng và lợi ích của FaceFarm, giúp nâng cao hiệu quả sản xuất nông nghiệp.',
  'Hướng dẫn từng bước để tạo và đăng ký tài khoản FaceFarm, giúp bạn nhanh chóng bắt đầu sử dụng.',
  'Quy trình xác thực và kích hoạt tài khoản FaceFarm, đảm bảo tính bảo mật và sử dụng liền mạch.',
  'Giới thiệu giao diện chính của FaceFarm và cách sử dụng các chức năng cơ bản để quản lý trang trại.',
  'Hướng dẫn cấu hình thông tin đơn vị sản xuất trong FaceFarm để bắt đầu quản lý sản xuất.',

  'Cách ghi chép nhật ký sản xuất trên FaceFarm để theo dõi quá trình sản xuất một cách chi tiết.',
  'Hướng dẫn sử dụng mẫu nhật ký để nhập liệu nhanh chóng và chính xác.',
  'Theo dõi nhật ký sản xuất để đánh giá hiệu quả sản xuất và điều chỉnh kịp thời.',
  'Hướng dẫn cập nhật và chỉnh sửa nhật ký sản xuất để đảm bảo dữ liệu luôn chính xác.',
  'Sử dụng công cụ thống kê của FaceFarm để phân tích và đánh giá hiệu quả sản xuất.',
  'Hướng dẫn xuất báo cáo từ nhật ký sản xuất để có cái nhìn tổng quan về hoạt động sản xuất.',

  'Nhập liệu và quản lý thông tin nông dược trong FaceFarm để theo dõi tình trạng sử dụng nông dược.',
  'Tra cứu nhanh thông tin nông dược trong FaceFarm để tối ưu hóa việc sử dụng nông dược.',
  'Cách nhập liệu và quản lý thông tin phân bón trên FaceFarm để kiểm soát chi phí và hiệu quả.',
  'Theo dõi tình trạng tồn kho phân bón để đảm bảo sử dụng phân bón một cách hiệu quả.',
  'Dự toán chi phí và lượng sử dụng phân bón để tối ưu hóa nguồn lực sản xuất.',
  'Phân tích hiệu quả sử dụng nông dược và phân bón để nâng cao năng suất và tiết kiệm chi phí.',

  'Cách thêm và quản lý thông tin nhân công trong FaceFarm để theo dõi và phân bổ công việc hiệu quả.',
  'Hướng dẫn phân quyền và phân công công việc cho nhân công trong hệ thống FaceFarm.',
  'Lập kế hoạch và phân công công việc để đảm bảo tiến độ sản xuất và nâng cao hiệu quả làm việc.',
  'Theo dõi tiến độ và báo cáo công việc để đánh giá hiệu quả và điều chỉnh kịp thời.',
  'Tối ưu hóa quy trình sản xuất thông qua việc phân tích dữ liệu từ FaceFarm.',
  'Sử dụng dữ liệu từ FaceFarm để cải thiện năng suất và hiệu quả sản xuất.',

  'Hướng dẫn cài đặt và sử dụng ứng dụng ghi chép nhanh, giúp tiết kiệm thời gian và nâng cao hiệu quả công việc.',
  'Đồng bộ hóa dữ liệu với hệ thống FaceFarm để đảm bảo tính liên tục và chính xác của thông tin.',
  'Tạo mã QR và truy xuất nguồn gốc sản phẩm để đáp ứng yêu cầu về minh bạch và an toàn thực phẩm.',
  'Hướng dẫn đăng tin bán hàng lên các sàn thương mại điện tử từ FaceFarm, giúp mở rộng thị trường tiêu thụ.',
  'Tích hợp FaceFarm với các hệ thống khác để nâng cao khả năng quản lý và tự động hóa quy trình sản xuất.',
  'Tối ưu hóa chiến lược kinh doanh qua FaceFarm, giúp tăng cường hiệu quả và lợi nhuận.'
]
const type = ['PDF', 'DOC', 'MP4', 'MP4', 'MP4', 'MP4']
const content = ['Content1', 'Content2', 'Content3']

const samplePDFLocationPaths = [
  'pdf1.pdf',
  'pdf2.pdf',
  'pdf3.pdf'
]
const sampleVideoFacefarmLocationPaths = [
  'Upv9AG7SulY',
  'PlZZXmt2oSY',
  '2QbawiL839g',
  'ZAFPv8YVxxs',
  'KN6Lfi7qoxo'
]
const sampleVideoWACALocationPaths = [
  'f-jDN7Im-9g',
  '2ZvjL7QItls',
  'PbnU9IoRAJA',
  'lCofA723a4A',
  'Upv9AG7SulY'
]
/**
 * Generate sample lessons data.
 *
 * This function generates an array of sample lessons data for each category lesson in the database.
 * Each category lesson will have a fixed number of lessons, and each lesson will include details such as
 * category lesson ID, name, description, type, content, order, location path, uploader ID, creation date, and update date.
 *
 * @author Canh
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of lesson objects.
 */
const generateLessions = async () => {
  const lessions = []
  const category_lessions = await CategoryLession.findAll()
  let currentCategoryId = null
  let order = 1
  let videoIndex = 0
  let nameIndex = 0
  let descriptionIndex = 0

  for (let i = 0; i < category_lessions.length; i++) {
    const category_lession = category_lessions[i]
    const lessionCategoryId = category_lession.id

    if (lessionCategoryId !== currentCategoryId) {
      order = 1
      currentCategoryId = lessionCategoryId
    }

    const randomContent = content[Math.floor(Math.random() * content.length)]
    const numLessons = 2

    for (let j = 0; j < numLessons; j++) {
      const randomType = type[Math.floor(Math.random() * type.length)]
      let randomLocationPath

      switch (randomType) {
        case 'MP4':
          if (lessionCategoryId >= 1 && lessionCategoryId <= 15) {
            randomLocationPath = sampleVideoWACALocationPaths[videoIndex % sampleVideoWACALocationPaths.length]
          } else if (lessionCategoryId > 15 && lessionCategoryId <= 30) {
            randomLocationPath = sampleVideoFacefarmLocationPaths[videoIndex % sampleVideoFacefarmLocationPaths.length]
          } else {
            randomLocationPath = 'defaultPath'
          }
          videoIndex++
          break
        case 'PDF':
          randomLocationPath = samplePDFLocationPaths[Math.floor(Math.random() * samplePDFLocationPaths.length)]
          break
        case 'DOC':
          randomLocationPath = samplePDFLocationPaths[Math.floor(Math.random() * samplePDFLocationPaths.length)]
          break
        default:
          randomLocationPath = 'defaultPath'
      }

      const categoryLessonName = titleExamples[nameIndex % titleExamples.length]
      const description = descriptionExamples[descriptionIndex % descriptionExamples.length]

      lessions.push({
        lessionCategoryId,
        name: categoryLessonName,
        description,
        type: randomType,
        content: randomContent,
        order,
        locationPath: randomLocationPath,
        uploadedBy: await generateUserId(),
        createAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })

      nameIndex++
      descriptionIndex++
      order++
    }
  }
  return lessions
}

/**
 * Seed the lessons table with sample data.
 *
 * This function seeds the lessons table with sample data generated by the generateLessions function.
 * It first checks if the table is empty, and if so, it populates the table with the generated data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedLessions = async () => {
  try {
    // Check if the lessons table is empty
    const count = await Lession.count()
    if (count === 0) {
      // If the table is empty, generate sample lessons data
      const lessions = await generateLessions()
      // Bulk create the sample data
      await Lession.bulkCreate(lessions, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Lessions table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Lessions data: ${error}`)
  }
}

module.exports = seedLessions
