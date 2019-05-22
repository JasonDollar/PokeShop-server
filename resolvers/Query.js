const P = require('../utils/pokedex')
const User = require('../models/User')
const PokemonOffer = require('../models/PokemonOffer')
const getUserId = require('../utils/getUserId')



module.exports = {
  Query: {
    async me(parent, args, ctx, info) {
      const { userId } = ctx.request.request
      const me = await User.findOne({ _id: userId })
      await me.populate('offers').execPopulate()
      // console.log(me.offers)
      if (!me) {
        throw new Error('No user found')
      }
      return {
        id: me._id,
        name: me.name,
        email: me.email,
        offers: me.offers,
      }
    },
    async user(parent, args, ctx, info) {
      const user = await User.findOne({ _id: args.userId })
      await user.populate('offers').execPopulate()
      // console.log(user.offers)
      if (!user) {
        throw new Error('No user found')
      }
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        offers: user.offers,
      }
    },
    async pokemons(parent, { skip = 0 }, ctx, info) {
      const pokemonRes = await P.resource(`/api/v2/pokemon/?offset=${skip}&limit=10`)
      const pokeList = []
      pokemonRes.results.map(item => {
        // https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png
        const pokemonId = item.url.replace('https://pokeapi.co/api/v2/pokemon/', '').replace('/', '')
        const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
        pokeList.push({
          id: pokemonId,
          name: item.name,
          image,
          url: item.url,
        })
      })
      return pokeList
      // https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20
    },
    async pokemon(parent, args, ctx, info) {
      const token = getUserId(ctx)
      // console.log(ctx.request.request.headers.authorization)
      // console.log(token)
      const pokemonRes = await P.resource(`/api/v2/pokemon/${args.id}`)
      // TODO maybe implement edges
      const pokeType = []
      // console.log(pokemonRes.sprites.front_default)
      pokemonRes.types.map(item => {
        pokeType.push({
          ...item.type,
          id: item.type.url.replace('https://pokeapi.co/api/v2/type/', '').replace('/', ''),
        })
      })
      return {
        id: pokemonRes.id,
        name: pokemonRes.name,
        url: `https://pokeapi.co/api/v2/pokemon/${pokemonRes.id}/`,
        image: pokemonRes.sprites.front_default,
        pokeType,
      }
    },
    async pokeType(parent, args, ctx, info) {
      const typeRes = await P.resource(`/api/v2/type/${args.id}`)
      const pokemon = typeRes.pokemon
        .map(item => {
          // console.log(item)
          
          const pokemonId = item.pokemon.url.replace('https://pokeapi.co/api/v2/pokemon/', '').replace('/', '')
          if (pokemonId > 810) return
          return {
            id: pokemonId,
            name: item.pokemon.name,
            url: item.pokemon.url,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
          }
        })
        .filter(item => item !== undefined)
        

      // console.log(typeRes.pokemon[0].pokemon)
      const type = {
        id: typeRes.id,
        name: typeRes.name,
        url: `https://pokeapi.co/api/v2/type/${args.id}`,
        pokemon,
      }
      return type
    },
    async pokemonOffers(parent, args, ctx, info) {
      const pokemonOffers = await PokemonOffer.find()
      return pokemonOffers
    },
    async pokemonOffer(parent, args, ctx, info) {
      const pokemonOffer = await PokemonOffer.findOne({ _id: args.id })
      await pokemonOffer.populate('seller').execPopulate()
      pokemonOffer.id = pokemonOffer._id
      return pokemonOffer
    },
  },
}