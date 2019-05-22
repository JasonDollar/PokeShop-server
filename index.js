const { GraphQLServer } = require('graphql-yoga') 
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
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

server.express.use((req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : ''
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }
  next()
})

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('db connected'))
  .catch(e => console.log(e))


server.start({ port: 4000 }, () => {
  console.log('started')
}) 
// https://assets.pokemon.com/assets/cms2/img/pokedex/full/022.png