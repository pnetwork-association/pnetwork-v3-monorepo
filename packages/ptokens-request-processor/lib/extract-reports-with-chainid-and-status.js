const { curry } = require('ramda')
const { logger } = require('./get-logger')
const { db, utils } = require('ptokens-utils')
const schemas = require('ptokens-schemas')

const extractReportsWithChainIdAndStatus = curry(
  (_collection, _chainId, _status) =>
    utils.getBlockchainTypeFromChainId(_chainId).then(_blockChainType => {
      logger.info(
        `Getting ${_blockChainType} events w/ status ${_status} from db...`
      )
      const query = { [schemas.constants.SCHEMA_STATUS_KEY]: _status }
      return db
        .findReports(_collection, query)
        .then(
          _reports =>
            logger.info(
              `Found ${_reports.length} events w/ status ${_status} into the db!`
            ) || _reports
        )
    })
)

module.exports = {
  extractReportsWithChainIdAndStatus,
}
