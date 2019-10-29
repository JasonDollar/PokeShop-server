const { GraphQLServer } = require('graphql-yoga') 
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config({ path: '.env' })
const resolvers = require('./resolvers')



const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context(request) {
    return {
      request,
    }
  },
})


server.express.use(cookieParser())

server.express.use((req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : ''
  if (token) {

    const verifiedToken = jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
      if (err) return { error: err.message }
      return decoded
    })

    if (verifiedToken.error) {
      req.userId = null
      return next()
    }
    req.userId = verifiedToken.userId
  }
  next()
})

// server.express.use((req, res, next) => {
//   if (!req.cookies) return next()
//   const { token } = req.cookies
//   console.log(token)
//   if (token) {
//     const { userId } = jwt.verify(token, process.env.APP_SECRET)
//     req.userId = userId
//   }
//   next()
// })


mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true
})
  .then(() => console.log('db connected'))
  .catch(e => console.log(e))

server.start({ port: process.env.PORT }, () => {
  console.log('started')
}) 

// https://assets.pokemon.com/assets/cms2/img/pokedex/full/022.png