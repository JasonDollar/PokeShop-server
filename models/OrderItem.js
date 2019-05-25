const { Schema, model, Types } = require('mongoose')

const orderItemSchema = new Schema({
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  pokemon: {
    //pokemon details from pokedex
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },

})

// orderItemSchema.virtual('owner', {
//   ref: 'user',
//   localField: 'owner',
//   foreignField: '_id',
// })

const OrderItem = model('orderitem', orderItemSchema)

module.exports = OrderItem