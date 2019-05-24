const { Schema, model } = require('mongoose')

const cartSchema = new Schema({
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  pokemon: {
    type: Schema.Types.ObjectId,
    ref: 'PokemonOffer',
    required: true,
  },


})

const CartItem = model('cartitem', cartSchema)

module.exports = CartItem