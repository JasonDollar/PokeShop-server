const {
  Schema, model, 
} = require('mongoose')

const pokemonSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please, provide pokemon name you want to sell'],
  },
  price: {
    type: Number,
    required: [true, 'Please, provide a price'],
    validate(val) {
      return val > 0
    },
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
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
    pokeType: [
      {
        type: String,
        enum: ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'],
      },
    ],
  },
}, {
  timestamps: true,
})

const PokemonOffer = model('PokemonOffer', pokemonSchema)

module.exports = PokemonOffer