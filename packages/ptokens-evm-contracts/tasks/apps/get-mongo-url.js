const { FLAG_NAME_MONGO_LOCALHOST } = require('../constants')

module.exports.getMongoUrlFromTaskArgs = _taskArgs =>
  _taskArgs[FLAG_NAME_MONGO_LOCALHOST] ? 'mongodb://127.0.0.1:27017' : 'mongodb://mongodb:27017'
