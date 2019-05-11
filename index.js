const { GraphQLServer } = require('graphql-yoga') 
const mongoose = require('mongoose')
const {mongoURI} = require('./config/keys.js')
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

mongoose.connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('db connected'))
  .catch(e => console.log(e))


server.start({ port: 4000 }, () => {
  console.log('started')
}) 
// https://assets.pokemon.com/assets/cms2/img/pokedex/full/022.png