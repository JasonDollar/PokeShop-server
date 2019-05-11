const jwt = require('jsonwebtoken')

const generateToken = (id, email) => jwt.sign({ userId: id, email }, 'thisisasecret', { expiresIn: '10 days' })

module.exports = generateToken