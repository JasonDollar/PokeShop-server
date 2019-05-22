const { Schema, model } = require('mongoose')

const pokemonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  pokemonId: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
})

const PokemonOffer = model('PokemonOffer', pokemonSchema)

module.exports = PokemonOffer