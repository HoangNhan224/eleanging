const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')

const router = express.Router()

const { infoLogger, errorLogger } = require('../logs/logger')

// TODO Định nghĩa các hằng số thông báo phản hồi để tránh hardcode chuỗi trong từng route
const MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  GROUP_NOT_FOUND: 'Group not found',
  GROUP_EXISTS: 'Group already exists',
  GROUP_NAME_REQUIRED: 'Group name is required',
  GROUP_IDS_REQUIRED: 'Group ids are required',
  CREATE_SUCCESS: 'Create group successfully',
  UPDATE_SUCCESS: 'Update group successfully',
  DELETE_SUCCESS: 'Delete group successfully',
  BULK_DELETE_SUCCESS: 'Delete groups successfully'
}

/**
 * Ghi log thông tin lỗi phục vụ mục đích debug hoặc kiểm tra.
 * Lưu lại chi tiết lỗi, dữ liệu request và endpoint xảy ra lỗi.
 *
 * @author nhan
 * @param {Object} req - Đối tượng HTTP request chứa thông tin yêu cầu từ client.
 * @param {Object} error - Đối tượng lỗi hoặc thông báo lỗi cần ghi log.
 */
function logError (req, error) {
  // TODO Ưu tiên lấy dữ liệu từ req.body.data; nếu không có thì dùng req.params hoặc req.query
  const request = req.body.data
    ? req.body.data
    : (req.params ? req.params : req.query)

  // TODO Ghi log lỗi kèm method, endpoint, payload request, nội dung lỗi và id người dùng
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,

    // BUG FIX:
    // Dùng optional chaining để tránh crash
    // khi error không phải instance của Error
    error: error?.message ?? error,

    user: req.user?.id
  })
}

/**
 * Ghi log thông tin request và response phục vụ mục đích debug hoặc kiểm tra.
 * Lưu lại endpoint được truy cập, HTTP method và dữ liệu request/response liên quan.
 *
 * @author nhan
 * @param {Object} req - Đối tượng HTTP request chứa thông tin yêu cầu từ client.
 * @param {Object} response - Dữ liệu response cần ghi log.
 */
function logInfo (req, response) {
  // TODO Ưu tiên lấy dữ liệu từ req.body.data; nếu không có thì dùng req.params hoặc req.query
  const request = req.body.data
    ? req.body.data
    : (req.params ? req.params : req.query)

  // TODO Ghi log thông tin request và response kèm method, endpoint, payload và id người dùng
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user?.id
  })
}

/**
 * Trả về danh sách group dạng rút gọn (chỉ id và name) dùng cho select/dropdown.
 *
 * @author Nhan
 * @route GET /groups/list
 * @returns {Promise<Object>} JSON chứa mảng các bản ghi { id, name } của group.
 */
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    // Chỉ lấy id và name để tránh over-fetching
    const groups = await models.Group.findAll({
      attributes: ['id', 'name']
    })
    logInfo(req, groups)
    return res.json({ data: groups })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({
      message: MESSAGES.INTERNAL_SERVER_ERROR
    })
  }
})

/**
 * Trả về toàn bộ danh sách group, sắp xếp theo id giảm dần — giống categorycourse GET /.
 *
 * @author Canh
 * @route GET /groups
 * @returns {Promise<Object>} JSON chứa mảng tất cả bản ghi group.
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // TODO Lấy tất cả group với đầy đủ các trường, group mới nhất hiển thị trước
    const groups = await models.Group.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      order: [['id', 'DESC']]
    })

    logInfo(req, groups)

    return res.json({ data: groups })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

/**
 * Tạo mới một group sau khi validate tên và kiểm tra trùng lặp — giống categorycourse POST /.
 *
 * @author Nhan
 * @route POST /groups
 * @returns {Promise<Object>} 201 kèm dữ liệu group vừa tạo nếu thành công;
 *   400 nếu thiếu tên; 409 nếu tên group đã tồn tại; 500 nếu lỗi server.
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // TODO Lấy name và description từ body của request
    const { name, description } = req.body.data

    // TODO Kiểm tra name không được rỗng hoặc chỉ chứa khoảng trắng
    if (!name || !name.trim()) {
      return res.status(400).json({ message: MESSAGES.GROUP_NAME_REQUIRED })
    }

    // TODO Kiểm tra xem đã tồn tại group có cùng tên (sau khi trim) chưa
    const existedGroup = await models.Group.findOne({
      where: { name: name.trim() }
    })

    // TODO Trả về 409 Conflict nếu phát hiện tên group bị trùng
    if (existedGroup) {
      return res.status(409).json({ message: MESSAGES.GROUP_EXISTS })
    }

    // TODO Tạo group mới với tên đã trim; mặc định description là chuỗi rỗng nếu không truyền
    const createdGroup = await models.Group.create({
      name: name.trim(),
      description: description?.trim() || ''
    })

    logInfo(req, createdGroup)

    return res.status(201).json({
      message: MESSAGES.CREATE_SUCCESS,
      data: createdGroup
    })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

/**
 * Cập nhật tên và mô tả của một group theo id — giống categorycourse PUT /:id.
 *
 * @author Nhan
 * @route PUT /groups/:id
 * @returns {Promise<Object>} Dữ liệu group sau khi cập nhật nếu thành công;
 *   400 nếu thiếu tên; 404 nếu không tìm thấy group; 409 nếu tên mới trùng với group khác;
 *   500 nếu lỗi server.
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    // TODO Lấy id từ route params và các trường cần cập nhật từ body request
    const { id } = req.params
    const { name, description } = req.body.data

    // TODO Kiểm tra name không được rỗng hoặc chỉ chứa khoảng trắng
    if (!name || !name.trim()) {
      return res.status(400).json({ message: MESSAGES.GROUP_NAME_REQUIRED })
    }

    // TODO Kiểm tra group cần cập nhật có tồn tại trong database không
    const group = await models.Group.findByPk(id)

    // TODO Trả về 404 nếu không tìm thấy group với id tương ứng
    if (!group) {
      return res.status(404).json({ message: MESSAGES.GROUP_NOT_FOUND })
    }

    // TODO Kiểm tra xem tên mới (sau khi trim) có bị trùng với group nào khác không
    const existedGroup = await models.Group.findOne({
      where: { name: name.trim() }
    })

    // TODO Chỉ trả về 409 nếu tên trùng thuộc về group khác (không phải chính group đang sửa)
    if (existedGroup && existedGroup.id !== Number(id)) {
      return res.status(409).json({ message: MESSAGES.GROUP_EXISTS })
    }

    // TODO Cập nhật name và description đã trim; mặc định description là chuỗi rỗng nếu không truyền
    await group.update({
      name: name.trim(),
      description: description?.trim() || ''
    })

    logInfo(req, group)

    return res.json({
      message: MESSAGES.UPDATE_SUCCESS,
      data: group
    })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

/**
 * Xóa nhiều group cùng lúc theo danh sách id.
 * IMPORTANT: phải đặt TRƯỚC route /:id — nếu không Express sẽ hiểu "bulk-delete" là một id param.
 *
 * @author Nhan
 * @route DELETE /groups/bulk-delete
 * @returns {Promise<Object>} Thông báo thành công nếu xóa xong;
 *   400 nếu mảng ids rỗng hoặc không hợp lệ; 500 nếu lỗi server.
 */
router.delete('/bulk-delete', isAuthenticated, async (req, res) => {
  try {
    // TODO Lấy mảng id các group cần xóa từ body request
    const { ids } = req.body

    // TODO Kiểm tra ids phải là mảng và không được rỗng trước khi thực hiện xóa
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: MESSAGES.GROUP_IDS_REQUIRED })
    }

    // TODO Xóa tất cả group có id nằm trong mảng ids bằng một câu query duy nhất
    await models.Group.destroy({ where: { id: ids } })

    logInfo(req, ids)

    return res.json({ message: MESSAGES.BULK_DELETE_SUCCESS })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

/**
 * Trả về thông tin chi tiết của một group theo primary key — thêm mới giống categorycourse GET /:id.
 *
 * @author Canh
 * @route GET /groups/:id
 * @returns {Promise<Object>} Dữ liệu group nếu tìm thấy;
 *   404 nếu không tìm thấy group; 500 nếu lỗi server.
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    // TODO Lấy id của group từ route params
    const { id } = req.params

    // TODO Tìm group theo primary key với đầy đủ các trường hiển thị
    const group = await models.Group.findByPk(id, {
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
    })

    // TODO Trả về 404 nếu không tìm thấy group với id tương ứng
    if (!group) {
      return res.status(404).json({ message: MESSAGES.GROUP_NOT_FOUND })
    }

    logInfo(req, group)

    return res.json({ data: group })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

/**
 * Xóa một group theo primary key — giống categorycourse DELETE /:id.
 *
 * @author Nhan
 * @route DELETE /groups/:id
 * @returns {Promise<Object>} Thông báo thành công nếu xóa xong;
 *   404 nếu không tìm thấy group; 500 nếu lỗi server.
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // TODO Lấy id của group từ route params
    const { id } = req.params

    // TODO Kiểm tra group cần xóa có tồn tại trong database trước khi thực hiện xóa
    const group = await models.Group.findByPk(id)

    // TODO Trả về 404 nếu không tìm thấy group với id tương ứng
    if (!group) {
      return res.status(404).json({ message: MESSAGES.GROUP_NOT_FOUND })
    }

    // TODO Xóa vĩnh viễn bản ghi group khỏi database
    await group.destroy()

    // TODO Ghi log id đã xóa để phục vụ mục đích kiểm tra (audit trail)
    logInfo(req, { deletedId: id })

    return res.json({ message: MESSAGES.DELETE_SUCCESS })
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

module.exports = router
