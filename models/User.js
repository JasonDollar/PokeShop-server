const { Schema, model } = require('mongoose')
const validator = require('validator')

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Please, provide an email'],
    validate: [validator.isEmail, 'You must provide valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please, provide a password'],
    validate(val) {
      if (val.length <= 6) {
        throw new Error('Your password is too short') 
      } else if (val.includes('password')) {
        throw new Error('Your password can\'t be "password"')
      }
    },
  },
  name: {
    type: String,
    required: [true, 'Please, provide your name'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  }
}, {
  timestamps: true,
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

userSchema.virtual('cart', {
  ref: 'cartitem',
  localField: '_id',
  foreignField: 'user',
})



const User = model('user', userSchema)

module.exports = User