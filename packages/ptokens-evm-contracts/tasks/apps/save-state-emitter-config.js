const path = require('path')
const constants = require('ptokens-constants')
const { maybeSaveConfiguration } = require('./save-configuration')
const { addSupportedChains } = require('./add-supported-chains')
const PATH_TO_GUARDIAN_APP = path.join(__dirname, '../../../../apps/ptokens-guardian')
const { addProtocols } = require('./add-protocols')
const { addIdentity } = require('./add-identity')

const addInterval = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_INTERVAL]: 30, // seconds
  })

module.exports.saveStateEmitterConfiguration = (_taskArgs, _hre) =>
  Promise.resolve({})
    .then(addSupportedChains)
    .then(addProtocols(_taskArgs))
    .then(addIdentity)
    .then(addInterval)
    .then(
      maybeSaveConfiguration(
        _taskArgs,
        'State emitter',
        `${PATH_TO_GUARDIAN_APP}/state-emitter.config.json`
      )
    )
