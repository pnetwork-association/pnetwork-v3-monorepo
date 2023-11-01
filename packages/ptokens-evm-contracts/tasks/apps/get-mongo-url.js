const { FLAG_MONGO_LOCALHOST } = require('../constants')

module.exports.getMongoUrlFromTaskArgs = taskArgs =>
  taskArgs[FLAG_MONGO_LOCALHOST] ? 'mongodb://127.0.0.1:27017' : 'mongodb://mongodb:27017'
