const { curry } = require('ramda')
const { logger } = require('./get-logger')
const { db, utils } = require('ptokens-utils')
const schemas = require('ptokens-schemas')

const extractReportsWithChainIdAndTxHash = curry(
  (_collection, _chainId, _txHashes) =>
    utils.getBlockchainTypeFromChainId(_chainId).then(_blockChainType => {
      logger.info(
        `Getting ${_blockChainType} events w/ transaction hash ${_txHashes} from db...`
      )
      const query = {
        _id: {
          $in: _txHashes.map(schemas.db.access.getEventId(_chainId)),
        },
      }
      return db
        .findReports(_collection, query)
        .then(
          _reports =>
            logger.info(`Found ${_reports.length} events into the db!`) ||
            _reports
        )
    })
)

module.exports = {
  extractReportsWithChainIdAndTxHash,
}
