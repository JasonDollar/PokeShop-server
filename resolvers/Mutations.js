const bcrypt = require('bcryptjs')
// const mongoose = require('mongoose')
// const pokemon = require('pokemon')
const User = require('../models/User')
const Wallet = require('../models/Wallet')
const CartItem = require('../models/CartItem')
const PokemonOffer = require('../models/PokemonOffer')
const OrderItem = require('../models/OrderItem')
const Order = require('../models/Order')
const generateToken = require('../utils/generateToken')
const getUserId = require('../utils/getUserId')
const sendMoney = require('../utils/sendMoney')

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
        user: {
          id,
          name: newUser.name,
          email: newUser.email,
        },
        token,
      }
    },
    async login(parent, args, ctx, info) {
      const { email, password } = args.data
      const user = await User.findOne({ email })
      // user.toJSON()
      if (!user) {
        throw new Error('Unable to login')
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        throw new Error('Unable to login')
      }
      const token = generateToken(user._id, email)
      // console.log(user)
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      }
    },
    async sellPokemon(parent, args, ctx, info) {
      const userId = getUserId(ctx)
      if (!userId) {
        throw new Error('You must be logged in')
      }
      
      if (!args.data.name) throw new Error('Please, provide a pokemon name')

      const pokemonRes = await P.resource(`/api/v2/pokemon/${args.data.name}`)
      const pokemonOffer = new PokemonOffer({
        ...args.data,
        seller: userId,
        pokemon: {
          id: pokemonRes.id,
          name: pokemonRes.name,
          url: `https://pokeapi.co/api/v2/pokemon/${pokemonRes.id}/`,
          image: pokemonRes.sprites.front_default,
          pokeType: pokemonRes.types.map(item => item.type.name),
        },
      })
      const saved = await pokemonOffer.save()
      await saved.populate('seller', 'id name email').execPopulate()
      return saved
    },
    async addToCart(parent, args, ctx, info) {
      const { id: pokemonOfferId } = args
      const userId = getUserId(ctx)
      if (!userId) {
        throw new Error('You must be logged in')
      }
      const pokemonOffer = await PokemonOffer.findOne({ _id: pokemonOfferId, available: true })
      if (!pokemonOffer) throw new Error('No such item is available for sale')

      const cartItem = await CartItem.findOne({ pokemon: pokemonOfferId, user: userId })
      if (cartItem) {
        cartItem.quantity += 1
        const savedCartItem = await cartItem.save()
        await savedCartItem.populate(['pokemon', 'pokemon.pokemon']).populate({ path: 'user', select: 'id name email' }).execPopulate()
        // console.log(savedCartItem.user)
        return cartItem
      }
      const newCartItem = new CartItem({
        user: userId,
        pokemon: pokemonOfferId,
      })
      const savedNewCartItem = await newCartItem.save()
      await savedNewCartItem.populate(['pokemon', 'pokemon.pokemon']).populate({ path: 'user', select: 'id name email' }).execPopulate()

      return savedNewCartItem
    },
    async removeFromCart(parent, args, ctx, info) {
      const { id: cartItemId } = args
      const userId = getUserId(ctx)
      if (!userId) {
        throw new Error('You must be logged in')
      }
      let cartItem = await CartItem.findOne({ _id: cartItemId, user: userId })
      if (cartItem.quantity >= 2) {
        cartItem.quantity -= 1
        const savedCartItem = await cartItem.save()
        await savedCartItem.populate(['pokemon', 'pokemon.pokemon']).populate({ path: 'user', select: 'id name email' }).execPopulate()
        // console.log(savedCartItem.user)
        return cartItem
      }
      await CartItem.deleteOne({ _id: cartItemId })
      return null
    },
    async orderPokemons(parent, args, ctx, info) {
      const userId = getUserId(ctx)
      if (!userId) {
        throw new Error('You must be logged in')
      }
      
      const cart = await CartItem.find({ user: userId }).populate('pokemon')
      if (cart.length <= 0) throw new Error('You don\'t have anything in your cart')
      const cartPriceTotal = cart.reduce((acc, item) => acc + (item.pokemon.price * item.quantity), 0)
      const userWallet = await Wallet.findOne({ $and: [{ owner: userId }, { balance: { $gte: cartPriceTotal } }] })

      if (!userWallet) {
        throw new Error('You don\'t have enough credits to make a purchase')
      }
      
      const cartItemsIds = cart.map(item => item.id)

      const orderItems = []
      cart.forEach(item => {
        const newOrderItem = {
          quantity: item.quantity,
          price: item.pokemon.price * item.quantity,
          seller: item.pokemon.seller,
          user: item.user,
          pokemon: item.pokemon.pokemon,
        }
        orderItems.push(new OrderItem(newOrderItem))
      })

      const savedOrders = await OrderItem.create(orderItems) 

      const order = new Order({ 
        price: savedOrders.reduce((acc, item) => acc + item.price, 0),
        user: userId,
        items: savedOrders.map(item => item.id),
      })
      const orderSavedInDB = await order.save()

      await sendMoney(savedOrders.map(item => ({
        user: item.seller,
        payment: item.price,
      })))

      userWallet.balance -= orderSavedInDB.price
      await userWallet.save()
      
      await orderSavedInDB.populate('items').populate({ path: 'user', select: 'id name email' }).execPopulate()
      await CartItem.deleteMany({ _id: { $in: cartItemsIds } })
      return orderSavedInDB
    },
  },
}