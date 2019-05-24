const { Schema, model } = require('mongoose')

const walletSchema = new Schema({
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

// walletSchema.virtual('owner', {
//   ref: 'user',
//   localField: 'owner',
//   foreignField: '_id',
// })

const Wallet = model('wallet', walletSchema)

module.exports = Wallet