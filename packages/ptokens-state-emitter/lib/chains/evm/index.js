const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')

const addSyncStateToStatus = R.curry(
  (_status, _networkId, _block) =>
    logger.debug(`Status: Adding block ${_block.number} data to sync state...`) || {
      [_networkId]: {
        [constants.config.KEY_LATEST_BLOCK_HASH]: _block.hash,
        [constants.config.KEY_LATEST_BLOCK_NUMBER]: _block.number,
        [constants.config.KEY_LATEST_BLOCK_TS]: _block.timestamp,
      },
    }
)

const getLastBlockAndAddToStatus = R.curry(
  (_config, _status) =>
    new Promise((resolve, reject) => {
      const networkId = _config[constants.config.KEY_NETWORK_ID]
      const provider = new ethers.JsonRpcProvider(_config[constants.config.KEY_PROVIDER_URL])
      return provider
        .getBlockNumber()
        .then(_number => provider.getBlock(_number))
        .then(addSyncStateToStatus(_status, networkId))
        .then(resolve)
        .catch(reject)
    })
)

module.exports.getSyncState = _chainConfiguration =>
  logger.info('Status: getting sync state on EVM...') ||
  Promise.resolve({}).then(getLastBlockAndAddToStatus(_chainConfiguration))
