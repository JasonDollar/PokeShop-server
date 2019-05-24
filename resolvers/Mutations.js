const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const pokemon = require('pokemon')
const User = require('../models/User')
const Wallet = require('../models/Wallet')
const CartItem = require('../models/CartItem')
const PokemonOffer = require('../models/PokemonOffer')
const generateToken = require('../utils/generateToken')
const getUserId = require('../utils/getUserId')

const P = require('../utils/pokedex')

module.exports = {
  Mutation: {
    async createUser(parent, args, ctx, info) {
      const { name, email, password } = args.data
      const user = await User.findOne({ email })
      if (user) {
        throw new Error('User already exists')
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ name, email, password: hashedPassword })
      const { _id: id } = await newUser.save()
      const wallet = new Wallet({ owner: id })
      await wallet.save()
      const token = generateToken(newUser._id, email)
      return {
        user: newUser,
        token,
      }
    },
    async login(parent, args, ctx, info) {
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
    async sellPokemon(parent, args, ctx, info) {
      const userId = getUserId(ctx)
      if (!userId) {
        throw new Error('You must be logged in')
      }
      const pokemonRes = await P.resource(`/api/v2/pokemon/${args.data.name}`)
      const pokemonOffer = new PokemonOffer({
        ...args.data,
        seller: userId,
        pokemon: {
          id: new mongoose.Types.ObjectId(),
          pokeId: pokemonRes.id,
          name: pokemonRes.name,
          url: `https://pokeapi.co/api/v2/pokemon/${pokemonRes.id}/`,
          image: pokemonRes.sprites.front_default,
        },
      })
      const saved = await pokemonOffer.save()
      await saved.populate('seller').execPopulate()
      return saved
    },
    async addToCart(parent, args, ctx, info) {
      const { id: pokemonOfferId } = args
      const userId = getUserId(ctx)
      if (!userId) {
        throw new Error('You must be logged in')
      }
      const pokemonOffer = await PokemonOffer.findById(pokemonOfferId)
      if (!pokemonOffer) throw new Error('No such is available for sale')
      const cartItem = await CartItem.findOne({ pokemon: pokemonOfferId })
      if (cartItem) {
        cartItem.quantity += 1
        const savedCartItem = await cartItem.save()
        await savedCartItem.populate('pokemon').execPopulate()
        await savedCartItem.populate('user').execPopulate()
        return cartItem
      }
      const newCartItem = new CartItem({
        user: userId,
        pokemon: pokemonOfferId,
      })
      const savedNewCartItem = await newCartItem.save()
      await savedNewCartItem.populate('pokemon').execPopulate()
      await savedNewCartItem.populate('user').execPopulate()
      return savedNewCartItem
    },
  },
}