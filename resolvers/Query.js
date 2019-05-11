const Pokedex = require('pokedex-promise-v2')
const User = require('../models/User')

const P = new Pokedex()

module.exports = {
  Query: {
    async me(parent, args, ctx, info) {
      const me = await User.findOne({ email: args.email })
      if (!me) {
        throw new Error('No user found')
      }
      return me
    },
    async pokemons(parent, { skip = 0 }, ctx, info) {
      const pokemonRes = await P.resource([`/api/v2/pokemon/?offset=${skip}&limit=10`])
      const pokeList = []
      pokemonRes[0].results.map(item => {
        // https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png
        const pokemonId = item.url.replace('https://pokeapi.co/api/v2/pokemon/', '').replace('/', '')
        const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
        pokeList.push({
          id: pokemonId,
          name: item.name,
          url,
        })
      })
      // console.log(JSON.stringify(pokeList, undefined, 2))
      return pokeList
      // https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20
    },
  },
}