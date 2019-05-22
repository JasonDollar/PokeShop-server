const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    validate(val) {
      if (val.length <= 6) {
        throw new Error('to short') 
      } else if (val.includes('password')) {
        throw new Error('Your password can\'t be password')
      }
    },
  },
  name: {
    type: String,
    required: true,
  },
})

userSchema.virtual('offers', {
  ref: 'PokemonOffer',
  localField: '_id',
  foreignField: 'seller',
})

userSchema.virtual('wallet', {
  ref: 'wallet',
  localField: '_id',
  foreignField: 'owner',
})

const User = model('user', userSchema)

module.exports = User