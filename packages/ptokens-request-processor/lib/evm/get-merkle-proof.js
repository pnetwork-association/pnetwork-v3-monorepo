const R = require('ramda')
const errors = require('../errors')
const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const constants = require('ptokens-constants')

module.exports.getMerkleProof = (_collection, _myAddress) =>
  logger.info('Getting proof...') ||
  _collection
    .find({ [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.ACTORS_PROPAGATED })
    .sort({ [constants.db.KEY_WITNESSED_TS]: -1 })
    .toArray()
    .then(R.propOr({}, 0))
    .then(R.propOr([], constants.db.KEY_EVENT_ARGS))
    .then(([_epoch, _actors, _actorsTypes]) =>
      R.isNil(_epoch)
        ? Promise.reject(new Error(errors.ERROR_NO_ACTORS_PROPAGATED_EVENT_FOUND))
        : utils.getMerkleProof(_epoch, _actors, _actorsTypes, _myAddress)
    )
