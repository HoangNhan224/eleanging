const { fakerEN: faker } = require('@faker-js/faker')
const Course = require('../models/course')
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

const sampleNames = [
  'WACA - Hướng dẫn Đăng nhập và Sử dụng Portal',
  'WACA - Thực hành Nghiệp vụ Kế toán',
  'WACA - Quản lý Tồn kho và Vật tư',
  'WACA - Quản lý Tài sản và Chi phí',
  'WACA - Quản lý Tài chính và Báo cáo',
  'FaceFarm: Giới thiệu và Thiết lập cơ bản',
  'FaceFarm: Quản lý nhật ký sản xuất',
  'FaceFarm: Quản lý nông dược và phân bón',
  'FaceFarm: Quản lý nhân công và công việc',
  'FaceFarm: Ứng dụng nâng cao và thương mại điện tử'
]
const sampleDescriptions = [
  'Khám phá thế giới nông nghiệp công nghệ cao với khóa học nhập môn này.;;Học các khái niệm cơ bản và kỹ thuật sử dụng để tối ưu hóa sản xuất nông nghiệp.;;Tìm hiểu về việc ứng dụng công nghệ cảm biến và hệ thống tự động hóa trong quản lý trang trại.;;Nắm bắt các kỹ thuật phân tích dữ liệu để đưa ra quyết định sản xuất thông minh.;;Trải nghiệm thực hành với các công cụ phổ biến như hệ thống quản lý trang trại và thiết bị IoT.;;Hiểu quy trình sản xuất từ thu thập dữ liệu đến đánh giá hiệu quả.;;Làm việc trên các dự án thực tế để áp dụng kiến thức của bạn.;;Khám phá cách nông nghiệp công nghệ cao được sử dụng trong các ngành khác nhau.;;Nâng cao kỹ năng giải quyết vấn đề và tư duy phân tích của bạn.;;Không cần kinh nghiệm trước, khóa học này hoàn hảo cho người mới bắt đầu.;;Bắt đầu hành trình trở thành chuyên gia nông nghiệp công nghệ cao ngay hôm nay.;;Bạn cũng sẽ học về quản lý dữ liệu, kỹ thuật tăng năng suất và tầm quan trọng của đạo đức trong nông nghiệp.;;Khóa học bao gồm các bài giảng của chuyên gia trong ngành.;;Bạn sẽ có quyền truy cập vào cộng đồng trực tuyến hỗ trợ và tài nguyên bổ sung.;;Đến cuối khóa học, bạn sẽ sẵn sàng cho các nghiên cứu nông nghiệp tiên tiến hơn.',
  'Khám phá các bí quyết tiếp thị nông sản thành công với khóa học toàn diện này.;;Hiểu các nguyên tắc cốt lõi của chiến lược tiếp thị nông sản trực tuyến.;;Học cách tạo chiến dịch tiếp thị trên mạng xã hội hiệu quả và tối ưu hóa website bán hàng nông sản.;;Tìm hiểu về tiếp thị qua email và kỹ thuật tiếp thị nội dung.;; Khám phá vai trò của phân tích trong việc đo lường thành công của các chiến dịch.;;Trải nghiệm thực hành với các công cụ tiếp thị kỹ thuật số phổ biến.;;Nghiên cứu các chiến lược tiếp thị nông sản thành công qua các trường hợp thực tế.;;Phát triển hiểu biết vững chắc về SEO, SEM và quảng cáo PPC.;;Khóa học này lý tưởng cho những người muốn trở thành chuyên gia tiếp thị nông sản hoặc chủ doanh nghiệp nhỏ.;;Làm chủ kỹ năng cần thiết để thành công trong thế giới kỹ thuật số.;;Bạn cũng sẽ khám phá tầm quan trọng của tiếp thị trên thiết bị di động và trải nghiệm người dùng.;; Nắm bắt những xu hướng và công nghệ mới nhất trong tiếp thị kỹ thuật số.;;Tham gia các buổi hội thảo tương tác và các dự án nhóm.;;Đến cuối khóa học, bạn sẽ sẵn sàng tạo và thực hiện các chiến lược tiếp thị nông sản của riêng mình.',
  'Khám phá các kỹ thuật quản lý đất đai và tài nguyên trong nông nghiệp.;;Học các nguyên tắc cơ bản của quản lý đất đai và nước.;;Hiểu cách đánh giá chất lượng đất và tối ưu hóa sử dụng tài nguyên thiên nhiên.;;Thực hành các phương pháp bảo vệ đất và nước hiệu quả.;;Nghiên cứu các trường hợp thực tế về cải thiện đất đai và bảo vệ tài nguyên nước trong nông nghiệp.;;Phát triển các kỹ năng quản lý tài nguyên tự nhiên và tối ưu hóa quy trình sản xuất.;;Khóa học này phù hợp cho người muốn nâng cao kiến thức về quản lý tài nguyên trong nông nghiệp bền vững.;;Bạn cũng sẽ học về kỹ thuật tưới tiêu tiết kiệm nước và ứng phó với biến đổi khí hậu.;;Tham gia các dự án nhóm để áp dụng kiến thức vào thực tế.;;Đến cuối khóa học, bạn sẽ có khả năng quản lý tài nguyên một cách hiệu quả và bền vững.',
  'Khám phá nghệ thuật thiết kế đồ họa trong nông nghiệp với khóa học thân thiện với người mới bắt đầu này.;;Học các nguyên tắc cơ bản của thiết kế, bao gồm lý thuyết màu sắc, kiểu chữ và bố cục.;;Làm quen với phần mềm thiết kế tiêu chuẩn trong ngành như Adobe Photoshop và Illustrator.;;Phát triển kỹ năng của bạn thông qua các dự án và bài tập thực hành liên quan đến nông nghiệp.;;Khám phá quá trình tạo logo, tờ rơi và hình minh họa kỹ thuật số cho sản phẩm nông sản.;;Hiểu tầm quan trọng của xây dựng thương hiệu và nhận diện hình ảnh trong nông nghiệp.;;Nghiên cứu công việc của các nhà thiết kế nổi tiếng để lấy cảm hứng.;;Khóa học này lý tưởng cho những người muốn trở thành nhà thiết kế nông nghiệp hoặc các chuyên gia sáng tạo.;;Không cần kinh nghiệm thiết kế trước.;;Giải phóng sự sáng tạo của bạn và bắt đầu thiết kế nội dung nông nghiệp hấp dẫn về mặt hình ảnh.;;Bạn cũng sẽ học về thiết kế trải nghiệm người dùng (UX) và giao diện người dùng (UI).;;Tham gia các buổi phê bình và nhận phản hồi cá nhân về công việc của bạn.;;Đến cuối khóa học, bạn sẽ có một danh mục đầu tư mạnh mẽ để trưng bày kỹ năng của mình.'
]

const sampleSummaies = [
  'Nông nghiệp công nghệ cao: Khóa học này cung cấp kiến thức cơ bản về ứng dụng công nghệ hiện đại như cảm biến và tự động hóa trong nông nghiệp. Bạn sẽ học cách sử dụng công nghệ để tối ưu hóa quy trình sản xuất, tăng năng suất và phát triển trang trại thông minh.',
  'Tiếp thị nông sản trực tuyến: Khóa học giúp bạn hiểu cách tiếp thị nông sản qua các nền tảng số, từ việc tạo chiến dịch tiếp thị đến tối ưu hóa SEO và quảng cáo PPC. Bạn sẽ học các kỹ thuật tiếp thị hiện đại và làm chủ các công cụ tiếp thị kỹ thuật số.',
  'Quản lý tài nguyên đất và nước: Khóa học tập trung vào việc quản lý và bảo vệ tài nguyên thiên nhiên trong nông nghiệp. Bạn sẽ học cách tối ưu hóa sử dụng đất đai, bảo vệ nước và ứng phó với biến đổi khí hậu trong sản xuất nông nghiệp.',
  'Thiết kế đồ họa trong nông nghiệp: Khóa học giúp bạn phát triển kỹ năng thiết kế đồ họa liên quan đến nông sản, từ thiết kế logo đến xây dựng thương hiệu. Bạn sẽ học cách sử dụng phần mềm thiết kế và tạo ra nội dung hình ảnh hấp dẫn cho ngành nông nghiệp.'
]

const sampleImage = ['course1.png', 'course2.png', 'course3.png', 'course4.png', 'course5.png', 'course6.png',
  'course7.png', 'course8.png', 'course9.png', 'course10.png', 'course11.png', 'course12.png',
  'course13.png', 'course14.png', 'course15.png']
/**
 * Generate a list of sample courses.
 *
 * This function creates an array of sample courses using predefined sample data for names, summaries, descriptions, and images.
 * Each course includes details such as category ID, name, summary, description, assigned user ID, duration, start and end dates,
 * creation and update dates, location path, preparation requirements, and price.
 *
 * @author Canh
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of course objects.
 */
const generateCourses = async () => {
  const courses = []

  for (let i = 0; i < sampleNames.length; i++) {
    const categoryCourseId = i < 5 ? 1 : 2
    const name = sampleNames[i]
    const summary = sampleSummaies[Math.floor(Math.random() * sampleSummaies.length)]
    const description = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)]
    const randomImage = sampleImage[Math.floor(Math.random() * sampleImage.length)]
    const price = Math.random() < 0.5 ? 0 : faker.finance.amount({ min: 100, max: 1000, decimal: 2 })
    courses.push({
      categoryCourseId,
      name,
      summary,
      description,
      assignedBy: await generateUserId(),
      durationInMinute: faker.number.int({ min: 30, max: 120 }),
      startDate: faker.date.future(),
      endDate: faker.date.future(),
      createAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      locationPath: randomImage,
      prepare: 'Kiến thức cơ bản về công nghệ. Thiết bị cần thiết. Phần mềm hỗ trợ.',
      price,
      publicStatus: 1,
      publicDate: faker.date.past()
    })
  }
  return courses
}

/**
 * Seed the courses table with sample data.
 *
 * This function seeds the courses table with sample data generated by the generateCourses function.
 * It first checks if the table is empty, and if so, it populates the table with the generated data.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedCourses = async () => {
  try {
    // Check if the courses table is empty
    const count = await Course.count()
    if (count === 0) {
      // If the table is empty, generate sample courses data
      const courses = await generateCourses()
      // Bulk create the sample data
      await Course.bulkCreate(courses, { validate: true })
    } else {
      // If the table is not empty, log a message
      console.log('Courses table is not empty.')
    }
  } catch (error) {
    // Log any errors that occur during the seeding process
    console.log(`Failed to seed Courses data: ${error}`)
  }
}

module.exports = seedCourses
