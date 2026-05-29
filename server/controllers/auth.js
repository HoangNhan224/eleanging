const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const randToken = require('rand-token')
const { errorLogger, infoLogger } = require('../logs/logger')
const passport = require('../passport')
const CryptoJS = require('crypto-js')
const otpGenerator = require('otp-generator')
const crypto = require('crypto')
const transporter = require('../email')
const REFRESH_TOKEN_LIFE_LONG = 30 * 7 * 24 * 60 * 60 * 1000 // 30 ngày
const REFRESH_TOKEN_LIFE_SHORT = 7 * 1 * 24 * 60 * 60 * 1000 // 7 ngày

const {
  SALT_KEY,
  generateToken,
  REFRESH_TOKEN_SIZE
} = require('../utils')

const router = express.Router()

/**
 * Handles Google OAuth authentication and callback.
 *
 * @author Hien
 * @route GET /google
 * Initiates Google OAuth authentication.
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

/**
 * Handles the callback after Google OAuth authentication.
 *
 * @author Hien
 * @route GET /google/callback
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      // TODO If an error occurs, redirect to the login page with a server error code
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=SERVER_ERROR`
      return res.redirect(redirectUrl)
    }

    if (!user) {
      // TODO If the user is not found, redirect to the login page with an error code
      const errorCode = info && info.code ? info.code : 'GOOGLE_AUTH_ERROR'
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=${errorCode}`
      return res.redirect(redirectUrl)
    }

    try {
      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

      // TODO Function to get roles and permissions for the user
      const getGroupWithRoles = async (currentUser) => {
        const roles = await models.Role.findOne({
          where: { id: currentUser.roleId },
          attributes: ['id', 'name', 'description', 'roleVersion'],
          include: {
            model: models.Permission,
            attributes: ['id', 'name', 'description', 'url', 'method'],
            through: { attributes: [] }
          }
        })
        return roles
      }

      // TODO Prepare data for access token
      const userGroupData = await getGroupWithRoles(user)
      const dataForAccessToken = {
        id: user.id,
        GroupWithRoles: userGroupData,
        roleId: user.roleId,
        roleVersion: userGroupData?.roleVersion
      }
      // TODO Generate access token
      const accessToken = await generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
      )

      // TODO Generate or retrieve refresh token
      let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE)
      if (!user.refreshToken) {
        user.set({
          refreshToken
        })
        await user.save()
      } else {
        refreshToken = user.refreshToken
      }
      // TODO Set token expiration date
      const expiredToken = new Date(Date.now() + REFRESH_TOKEN_LIFE_LONG)
      await models.User.update({ expiredToken }, { where: { id: user.id } })

      const key = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles.description || ''), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()

      // TODO Set refresh token in cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: REFRESH_TOKEN_LIFE_LONG
      })
      // TODO Redirect to the login page with the necessary information
      const redirectUrl = `${process.env.FRONTEND_URL}/login?googleAuthSuccess=true&accessToken=${accessToken}&id=${user.id}&firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}&email=${encodeURIComponent(user.email)}&key=${encodeURIComponent(key)}&avatar=${encodeURIComponent(user.avatar)}`
      res.redirect(redirectUrl)
    } catch (err) {
      // TODO If an error occurs, redirect to the login page with the error code LOGIN_ERROR
      console.error('Token generation error:', err)
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=LOGIN_ERROR`
      res.redirect(redirectUrl)
    }
  })(req, res, next)
})

/**
 * Handles Microsoft OAuth authentication and callback.
 *
 * @author Canh
 * @route GET /microsoft
 * Initiates Microsoft OAuth authentication.
 */
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }))
/**
 * Handles the callback after Microsoft OAuth authentication.
 *
 * @author Canh
 * @route GET /microsoft/callback
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
router.get('/microsoft/callback', (req, res, next) => {
  passport.authenticate('microsoft', async (err, user, info) => {
    if (err) {
      console.error('Microsoft authentication error:', err)
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=SERVER_ERROR`
      return res.redirect(redirectUrl)
    }
    if (!user) {
      const errorCode = info && info.code ? info.code : 'MICROSOFT_AUTH_ERROR'
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=${errorCode}`
      return res.redirect(redirectUrl)
    }
    try {
      console.log('Microsoft User:', user)
      console.log('Microsoft Access Token111:', info.accessToken)
      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
      const getGroupWithRoles = async (currentUser) => {
        const roles = await models.Role.findOne({
          where: { id: currentUser.roleId },
          attributes: ['id', 'name', 'description', 'roleVersion'],
          include: {
            model: models.Permission,
            attributes: ['id', 'name', 'description', 'url', 'method'],
            through: { attributes: [] }
          }
        })
        return roles
      }

      // TODO Prepare data for access token
      const userGroupData = await getGroupWithRoles(user)
      const dataForAccessToken = {
        id: user.id,
        GroupWithRoles: userGroupData,
        roleId: user.roleId,
        roleVersion: userGroupData?.roleVersion
      }
      const accessToken = await generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
      )
      let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE)
      if (!user.refreshToken) {
        user.set({
          refreshToken
        })
        await user.save()
      } else {
        refreshToken = user.refreshToken
      }
      const expiredToken = new Date()
      expiredToken.setMonth(expiredToken.getMonth() + 1)
      await models.User.update({ expiredToken }, { where: { id: user.id } })
      const key = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles?.description || ''), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: REFRESH_TOKEN_LIFE_LONG
      })
      const redirectUrl = `${process.env.FRONTEND_URL}/login?microsoftAuthSuccess=true&accessToken=${accessToken}&id=${user.id}&firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}&email=${encodeURIComponent(user.email)}&key=${encodeURIComponent(key)}&avatar=${encodeURIComponent(user.avatar)}`
      res.redirect(redirectUrl)
    } catch (err) {
      console.error('Token generation error:', err)
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=LOGIN_ERROR`
      res.redirect(redirectUrl)
    }
  })(req, res, next)
})

/**
 * Handles user registration.
 *
 * @author Hien
 * @route POST /register
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object with registration status.
 * @throws {Error} If there is an error during user registration.
 */
router.post('/register', async (req, res) => {
  try {
    // TODO Extract username, email, and password from the request body
    const { username, email, password } = req.body.data
    console.log(username, email)

    // TODO Check if a user with the same username already exists
    const userByUsername = await models.User.findOne({
      where: { username }
    })

    // TODO Check if a user with the same email already exists
    const userByEmail = await models.User.findOne({
      where: { email }
    })

    // TODO If a user with the same username exists, return a 409 conflict status
    if (userByUsername) {
      return res.status(409).json({
        code: 409,
        message: 'Username already exists'
      })
    }

    // TODO If a user with the same email exists, return a 409 conflict status
    if (userByEmail) {
      return res.status(409).json({
        code: 409,
        message: 'Email already exists'
      })
    }

    // TODO Hash the password using bcrypt
    const hashPassword = bcrypt.hashSync(password, SALT_KEY)
    const newUser = {
      username,
      email,
      password: hashPassword,
      type: 'local'
    }
    // TODO Create a new user in the database
    const createdUser = await models.User.create(newUser)
    // TODO If user creation fails, return a 400 bad request status
    if (!createdUser) {
      return res.status(400).json({
        code: 400,
        message: 'Create new account failed'
      })
    }
    // TODO Return a success response with the username and email
    return res.json({
      username,
      email,
      status: 'Register success!'
    })
  } catch (error) {
    console.error('Error during user registration:', error)
    return res.status(500).json({
      code: 500,
      message: 'Internal server error. Please try again later'
    })
  }
})

/**
 * Handles user login.
 *
 * @author Hien
 * @route POST /login
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object with login status and user details.
 * @throws {Error} If there is an error during user login.
 */
router.post('/login', async (req, res) => {
  console.log('LOGINNNNNNNNNNNNNNNNNNN')
  try {
    // TODO Extract email, password, and keepMeLoggedIn from the request body
    const { email, password, keepMeLoggedIn } = req.body.data
    // TODO Find the user by email
    const user = await models.User.findOne({
      where: { email }
    })
    // TODO If user is not found, log the error and return a 401 status
    if (!user) {
      errorLogger.error({
        message: 'Login faileddddd!',
        path: '/login',
        method: 'POST'
      })
      return res.status(401).json({
        code: 401,
        message: 'User not found'
      })
    }
    // TODO Check if the user type is 'google'
    const type = user.type
    if (type === 'google') {
      return res.status(401).json({
        code: 401,
        message: 'Please login with google'
      })
    }
    // TODO Validate the password
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      errorLogger.error({
        message: 'Login failedd!',
        path: '/login',
        method: 'POST'
      })
      return res.status(401).json({
        code: 401,
        message: 'Incorrect password'
      })
    }
    // TODO Get access token life and secret from environment variables
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    // TODO Function to get roles and permissions for the user
    const getGroupWithRoles = async (currentUser) => {
      const roles = await models.Role.findOne({
        where: { id: currentUser.roleId },
        attributes: ['id', 'name', 'description', 'roleVersion'],
        include: {
          model: models.Permission,
          attributes: ['id', 'name', 'description', 'url', 'method'],
          through: { attributes: [] }
        }
      })
      return roles
    }

    // TODO Prepare data for access token
    const userGroupData = await getGroupWithRoles(user)
    const dataForAccessToken = {
      id: user.id,
      GroupWithRoles: userGroupData,
      roleId: user.roleId,
      roleVersion: userGroupData?.roleVersion
    }
    // TODO Generate access token
    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    )
    console.log(accessToken)
    // TODO If access token generation fails, log the error and return a 401 status
    if (!accessToken) {
      errorLogger.error({
        message: 'Create access token failed!',
        path: '/login',
        method: 'POST',
        obj: { email }
      })
      return res
        .status(401)
        .json({ code: 401, message: 'Login failed.' })
    }

    // TODO Generate or retrieve refresh token
    let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE)
    if (!user.refreshToken) {
      console.log('Create new refresh token')
      user.set({
        refreshToken
      })
      await user.save()
    } else {
      refreshToken = user.refreshToken
    }
    // TODO Set token expiration date
    const tokenExpiryTime = keepMeLoggedIn ? REFRESH_TOKEN_LIFE_LONG : REFRESH_TOKEN_LIFE_SHORT
    const expiredToken = new Date(Date.now() + tokenExpiryTime)
    await models.User.update({ expiredToken }, { where: { id: user.id } })

    infoLogger.info({
      message: 'Login success!',
      path: '/login',
      method: 'POST',
      obj: { email }
    })

    // TODO Encrypt user roles description
    const encryptedGroupWithRoles = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles?.description || ''), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()

    // TODO Set refresh token cookie with long expiration time if "Keep me logged in" is selected
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: tokenExpiryTime
    }
    res.cookie('refreshToken', refreshToken, cookieOptions)

    // TODO Return the response with access token and user details
    return res.json({
      accessToken,
      username: user.username,
      key: encryptedGroupWithRoles,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      groupId: user.groupId
    })
  } catch (error) {
    errorLogger.error({
      message: 'Login failed!',
      path: '/login',
      method: 'POST'
    })
    console.log(error)
    res.json({ error })
  }
})

/**
 * Handles user logout.
 *
 * @author Canh
 * @route POST /logout
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<Object>} The response object with logout status.
 * @throws {Error} If there is an error during user logout.
 */
router.post('/logout', async (req, res, next) => {
  console.log('LOGGGGOUTTTTTTTTTTTT')
  try {
    // TODO Extract refreshToken from cookies
    const { refreshToken } = req.cookies
    console.log(refreshToken, 'refreshTokenNnNnNnN')
    // TODO If no refreshToken is found, clear the cookie and return success message
    if (!refreshToken) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(200).json({ message: 'Logout success!' })
    }
    // TODO Verify the refreshToken to get the userId
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(200).json({ message: 'Logout success!' })
    }
    // TODO Find the user by userId
    const user = await models.User.findByPk(userId)
    // Clear the refreshToken cookie
    res.cookie('refreshToken', '', { expires: new Date(0) })
    // TODO Set user's refreshToken and expiredToken to null
    user.refreshToken = null
    user.expiredToken = null
    // TODO Save the updated user information
    await user.save()
    return res.status(200).json({ message: 'Logout success!' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
})

/**
 * Handles the refresh token process.
 *
 * @author Canh
 * @route POST /refresh
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<Object>} The response object with a new access token and user details.
 * @throws {Error} If there is an error during the refresh token process.
 */
router.post('/refresh', async (req, res, next) => {
  console.log('REFRESH TOKENNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
  try {
    console.log(req.cookies, 'req.cookies')
    const refreshToken = req.cookies.refreshToken
    console.log(refreshToken, 'refreshToken')
    // TODO If no refresh token is found, return a 403 status
    if (!refreshToken) {
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    // TODO Verify the refresh token to get the user ID
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      // If the token is invalid, clear the cookie and return a 403 status
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    console.log(userId, 'userIddddddddddddddddddddddddddddddd')
    // TODO Find the user by user ID
    const user = await models.User.findByPk(userId)

    // TODO Get access token life and secret from environment variables
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    // TODO Function to get roles and permissions for the user
    const getGroupWithRoles = async (currentUser) => {
      const roles = await models.Role.findOne({
        where: { id: currentUser.roleId },
        attributes: ['id', 'name', 'description', 'roleVersion'],
        include: {
          model: models.Permission,
          attributes: ['id', 'name', 'description', 'url', 'method'],
          through: { attributes: [] }
        }
      })
      return roles
    }

    // TODO Prepare data for access token
    const userGroupData = await getGroupWithRoles(user)
    const dataForAccessToken = {
      id: user.id,
      GroupWithRoles: userGroupData,
      roleId: user.roleId,
      roleVersion: userGroupData?.roleVersion
    }
    // TODO Generate access token
    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    )
    // TODO Encrypt user roles description
    const encryptedGroupWithRoles = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles?.description || ''), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()
    return res.json({
      accessToken,
      username: user.username,
      key: encryptedGroupWithRoles,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      groupId: user.groupId
    })
  } catch (error) {
    console.log(error, 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDĐ')
    res.json({ error: { message: 'dddddddddddddd' } })
  }
})

/**
 * Verifies the refresh token.
 *
 * @author Canh
 * @param {string} refreshToken - The refresh token to be verified.
 * @returns {Promise<string|null>} The user ID if the token is valid, otherwise null.
 * @throws {Error} If the token is not found or has expired.
 */
const verifyRefreshToken = async (refreshToken) => {
  try {
    // TODO Find the user with the given refresh token
    const user = await models.User.findOne({ where: { refreshToken } })
    if (!user) {
      throw new Error('Token not found')
    }
    // TODO Get the current date and time
    const now = new Date()
    // TODO  if the token has expired or if there is no expiration date
    if (user.expiredToken < now || !user.expiredToken) {
      console.log('Token has expired')
      user.expiredToken = null
      await user.save()
      throw new Error('Token has expired')
    }
    // TODO Return the user ID if the token is valid
    return user.id
  } catch (err) {
    return null
  }
}

/**
 * Sends an OTP via email to reset the password.
 *
 * @author Hien
 * @route POST /sendOTP
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object with the status of the OTP sending process.
 * @throws {Error} If there is an error during the OTP sending process.
 */
router.post('/sendOTP', async (req, res) => {
  console.log('SEND OTP', req.body.data)
  const { email, language } = req.body.data
  try {
    // TODO Find user by email
    const user = await models.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' })
    }

    // TODO Check user type
    if (user.type !== 'local') {
      return res.status(403).json({ code: 403, message: 'OTP can only be sent to local users' })
    }

    // TODO Generate 6-digit OTP
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')

    // TODO Save OTP to database and set expiration time
    user.otp = hashedOTP
    user.otpExpires = Date.now() + 70000 // OTP expires after 1 minute 10 seconds
    await user.save()

    // TODO Prepare email options based on language VI
    const mailOptions1 = {
      from: `E-Leaning 👻 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã OTP Đặt Lại Mật Khẩu',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Mã OTP của bạn</h2>
        <p style="font-size: 18px; text-align: center;">Sử dụng mã OTP sau để đặt lại mật khẩu của bạn:</p>
        <div style="padding: 10px; background-color: #f9f9f9; border-radius: 5px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #000;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">Mã OTP này có hiệu lực trong 1 phút.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
      </div>
      `
    }
    // TODO Prepare email options based on language EN
    const mailOptions = {
      from: `E-Leaning 👻 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password OTP',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Your OTP Code</h2>
        <p style="font-size: 18px; text-align: center;">Use the following OTP code to reset your password:</p>
        <div style="padding: 10px; background-color: #f9f9f9; border-radius: 5px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #000;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">This OTP is valid for 1 minute.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
      `
    }
    // TODO Send email with OTP based on language preference
    if (language) {
      if (language === 'vi') {
        await transporter.sendMail(mailOptions1)
      } else {
        await transporter.sendMail(mailOptions)
      }
    } else {
      await transporter.sendMail(mailOptions)
    }
    res.status(200).json({ code: 200, message: 'OTP sent to your email' })
  } catch (error) {
    console.error('Error sending OTP:', error)
    res.status(500).json({ code: 500, message: 'Error sending OTP', error: error.message })
  }
})

/**
 * Verifies the OTP for password reset.
 *
 * @author Hien
 * @route POST /verifyOTP
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object with the status of the OTP verification process.
 * @throws {Error} If there is an error during the OTP verification process.
 */
router.post('/verifyOTP', async (req, res) => {
  console.log('VERIFY OTP', req.body)
  const { email, otp } = req.body.data

  try {
    // TODO Find user by email
    const user = await models.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' })
    }

    // TODO Check if OTP has expired
    const now = Date.now()
    if (now > user.otpExpires) {
      return res.status(403).json({ code: 403, message: 'OTP has expired' })
    }

    // TODO Hash the provided OTP and compare with the stored hashed OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')
    if (hashedOTP !== user.otp) {
      return res.status(400).json({ code: 400, message: 'Invalid OTP' })
    }

    res.status(200).json({ code: 200, message: 'OTP verified successfully. You can now reset your password.' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({ code: 500, message: 'Error verifying OTP', error: error.message })
  }
})

/**
 * Resets the user's password after OTP has been verified.
 *
 * @author Hien
 * @route POST /resetPassword
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object with the status of the password reset process.
 * @throws {Error} If there is an error during the password reset process.
 */
router.post('/resetPassword', async (req, res) => {
  console.log('RESET PASSWORD', req.body)
  const { email, newPassword } = req.body.data

  try {
    // TODO Find user by email
    const user = await models.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' })
    }

    // TODO Check if OTP has been verified
    if (!user.otp) {
      return res.status(400).json({ code: 400, message: 'OTP not verified or already used' })
    }

    // TODO Update new password
    const hashPassword = bcrypt.hashSync(newPassword, SALT_KEY)
    user.password = hashPassword
    user.otp = null // Clear OTP after successful password reset
    user.otpExpires = null // Clear OTP expiration time
    await user.save()

    res.status(200).json({ code: 200, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ code: 500, message: 'Error resetting password', error: error.message })
  }
})

module.exports = router
