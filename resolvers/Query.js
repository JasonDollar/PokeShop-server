const P = require('../utils/pokedex')
const User = require('../models/User')
const Wallet = require('../models/Wallet')
const CartItem = require('../models/CartItem')
const Order = require('../models/Order')
const PokemonOffer = require('../models/PokemonOffer')
const getUserId = require('../utils/getUserId')
const pokeNames = require('../files/pokemonNames.json')


module.exports = {

  async me(parent, args, ctx, info) {
    const userId = getUserId(ctx)
    const me = await User.findOne({ _id: userId }).select('id name email role wallet').populate('wallet')

    if (!me) {
      throw new Error('No user found')
    }
    const cart = await CartItem.find({ user: userId }).populate('pokemon')
    await me.populate(['offers']).execPopulate()
    
    return {
      id: me._id,
      name: me.name,
      email: me.email,
      role: me.role,
      offers: me.offers,
      wallet: me.wallet,
      cart,
    }
  },
  async user(parent, args, ctx, info) {
    const user = await User.findById(args.userId).select('id name email role wallet').populate('wallet')
    await user.populate(['offers']).execPopulate()
      
    if (!user) {
      throw new Error('No user found')
    }
    return { 
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      offers: user.offers,
      wallet: user.wallet,
    }
  },
  async users(parent, args, ctx, info) {
    try {
      const userId = getUserId(ctx)
      const isAdmin = await User.countDocuments({ _id: userId, role: 'admin' })
      if (isAdmin.count <= 0) throw new Error('You don\'t have required permission')
      const users = await User.find().select('-password').populate('wallet')
      console.log(users[0])
      return users
    } catch (e) {
      throw new Error(e.message)
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
        // id: uuid(),
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
    const pokemonRes = await P.resource(`/api/v2/pokemon/${args.id}`)
    // TODO maybe implement edges
    const pokeType = []
    pokemonRes.types.map(item => {
      pokeType.push({
        ...item.type,
        typeId: item.type.url.replace('https://pokeapi.co/api/v2/type/', '').replace('/', ''),
        id: item.type.name,
      })
    })

    return {
      // id: uuid(),
      id: pokemonRes.id,
      name: pokemonRes.name,
      url: `https://pokeapi.co/api/v2/pokemon/${pokemonRes.id}/`,
      image: pokemonRes.sprites.front_default || '',
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
    const {
      skip = 0, limit = 24, minPrice = 0, maxPrice = 999999, pokemonTypes, 
    } = args
      
      
    let pokemonOffers
    let count
    if (pokemonTypes && pokemonTypes.length > 0) {
      count = await PokemonOffer.find({
        $and: [
          { available: true },
          { price: { $gte: minPrice } },
          { price: { $lte: maxPrice } },
          { 'pokemon.pokeType': { $all: pokemonTypes } },
        ], 
      }).count()
      pokemonOffers = await PokemonOffer.find({
        $and: [
          { available: true },
          { price: { $gte: minPrice } },
          { price: { $lte: maxPrice } },
          { 'pokemon.pokeType': { $all: pokemonTypes } },
        ], 
      }).limit(limit).skip(skip)
    } else {
      count = await PokemonOffer.find({ available: true }).count()
      pokemonOffers = await PokemonOffer.find({
        $and: [
          { available: true },
          { price: { $gte: minPrice } },
          { price: { $lte: maxPrice } },
        ], 
      }).limit(limit).skip(skip)
    }
    // console.log(pokemonOffers.count())

    return {
      count,
      offers: pokemonOffers,
    }
  },
  async pokemonOffer(parent, args, ctx, info) {
    const pokemonOffer = await PokemonOffer.findOne({ _id: args.id }).populate('seller', 'id name email')
    pokemonOffer.id = pokemonOffer._id
    return pokemonOffer
  },
  async userCredits(parent, args, ctx, info) {
    const id = getUserId(ctx) 
    const wallet = await Wallet.findOne({ owner: id }).populate('owner', 'id name email')
    if (!wallet) {
      return null
    } 
    return wallet
  },
  async userCart(parent, args, ctx, info) {
    const userId = getUserId(ctx) 
    const cart = await CartItem.find({ user: userId }).populate('pokemon')

    return cart
  },
  async orders(parent, args, ctx, info) {
    const userId = getUserId(ctx)
    const orders = await Order.find({ user: userId }).populate(['items', 'items.seller']).populate({ path: 'user', select: 'id name email' })
    return orders
  },
  async searchPokeName(parent, args, ctx, info) {
      
    if (args.name === '') return []
    const nameList = pokeNames.filter(item => item.toLowerCase().includes(args.name.toLowerCase())).sort().slice(0, 5)
    return nameList
  },
  
}