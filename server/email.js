const nodemailer = require('nodemailer')

/**
 * Creates a transporter object using the default SMTP transport.
 * This transporter will be used to send emails using the specified email service.
 *
 * @author Hien
 * @type {Object}
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

module.exports = transporter
