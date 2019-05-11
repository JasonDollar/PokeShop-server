const query = require('./Query')
const mutation = require('./Mutations')

module.exports = {
  ...query,
  ...mutation,
}