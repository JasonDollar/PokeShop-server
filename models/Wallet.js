const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  balance: {
    type: Number,
    required: true,
    default: 100000,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
})

// userSchema.virtual('offers', {
//   ref: 'PokemonOffer',
//   localField: '_id',
//   foreignField: 'seller',
// })

const Wallet = model('wallet', userSchema)

module.exports = Wallet