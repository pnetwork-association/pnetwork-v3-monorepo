const constants = require('ptokens-constants')
const { checkConfiguration } = require('../check-configuration')
const { getOperationsById } = require('../interfaces/get-operations-by-id')

const printInfo = _info =>
  (_info.length
    ? // eslint-disable-next-line no-console
      console.info(JSON.stringify(_info))
    : // eslint-disable-next-line no-console
      console.info(
        'No operation found! This does not necessarily mean that there is no related operation on-chain. Try to specify an hint block with --fromBlock.'
      )) || _info

const getOperationsByIdCommand = (_config, _id, _stateManagerAddress, _fromBlock) =>
  checkConfiguration(_config)
    .then(_config =>
      getOperationsById(
        _config[constants.config.KEY_PROVIDER_URL],
        _config[constants.config.KEY_NETWORK_ID],
        _id,
        _stateManagerAddress,
        _fromBlock
      )
    )
    .then(printInfo)

module.exports = { getOperationsByIdCommand }
