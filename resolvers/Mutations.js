const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

module.exports = {
  Mutation: {
    async createUser(parent, args, ctx, info) {
      const { name, email, password } = args.data
      const user = await User.findOne({ email })
      if (user) {
        throw new Error('User alreadyn exists')
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ name, email, password: hashedPassword })
      await newUser.save()
      const token = generateToken(newUser._id, email)
      return {
        user: newUser,
        token,
      }
    },
    async login(parent, args, ctx, info) {
      console.log(ctx.request.request.headers.authorization)
      // console.log(ctx.request.connection.context.Authorization)
      const { email, password } = args.data
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error('Unable to login')
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        throw new Error('Unable to login')
      }
      const token = generateToken(user._id, email)
      return {
        user,
        token,
      }
    },
  },
}