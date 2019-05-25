const {
 Schema, model, ObjectId, Types 
} = require('mongoose')
const uuid = require('uuid/v4')

const pokemonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  pokemon: {

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

const PokemonOffer = model('PokemonOffer', pokemonSchema)

module.exports = PokemonOffer