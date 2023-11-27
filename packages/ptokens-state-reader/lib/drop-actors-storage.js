const R = require('ramda')
const { logger } = require('./get-logger')
module.exports.dropActorsStorage = R.curry(_actorsStorage =>
  _actorsStorage.deleteMany({}).then(_ => logger.info('Previous actor storage dropped'))
)
