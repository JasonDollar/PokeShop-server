const { Schema, model, Types } = require('mongoose')

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'orderitem',
      required: true,
    },
  ],
})

// orderSchema.virtual('owner', {
//   ref: 'user',
//   localField: 'owner',
//   foreignField: '_id',
// })

const Order = model('order', orderSchema)

module.exports = Order