const { FLAG_MONGO_LOCALHOST } = require('../constants')

module.exports.getMongoUrlFromTaskArgs = taskArgs =>
  taskArgs[FLAG_MONGO_LOCALHOST] ? 'mongodb://localhost:27017' : 'mongodb://mongodb:27017'
