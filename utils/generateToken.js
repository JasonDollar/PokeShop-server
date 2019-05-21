const jwt = require('jsonwebtoken')

const generateToken = (id, email) => jwt.sign({ userId: id, email }, process.env.APP_SECRET, { expiresIn: '10 days' })

module.exports = generateToken