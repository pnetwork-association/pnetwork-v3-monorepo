const R = require('ramda')
const path = require('path')
const fs = require('node:fs/promises')
const constants = require('ptokens-constants')
const {
  getNetworkId,
  getPRouterAddress,
  getStateManagerAddress,
} = require('../lib/configuration-manager')

const TASK_FLAG_SHOW = 'show'
const TASK_FLAG_SHOW_DESC = 'Show result instead of saving it to a file'
const TASK_FLAG_MONGO_LOCALHOST = 'localhost'
const TASK_FLAG_MONGO_LOCALHOST_DESC = 'Set localhost into the mongo url (good for testing)'
const TASK_NAME_APPS_GENERATE_RELAYER = 'apps:generate-relayer-config'
const TASK_DESC_APPS_GENERATE_RELAYER =
  'Generate relayer configuration from the given network name.'

const PATH_TO_RELAYER_APP = path.join(__dirname, '../../../../apps/ptokens-relayer')

const prettyStringify = _object => JSON.stringify(_object, null, 2)

const saveConfiguration = R.curry((_what, _path, _configuration) =>
  fs
    .writeFile(_path, prettyStringify(_configuration))
    .then(_ => console.info(`${_what} configuration saved to ${_path}`))
)

const showConfiguration = (_what, _configuration) =>
  console.info(`# ${_what} configuration`) || console.info(prettyStringify(_configuration))

const maybeSaveConfiguration = R.curry((taskArgs, _what, _path, _configuration) =>
  taskArgs[TASK_FLAG_SHOW]
    ? showConfiguration(_what, _configuration)
    : saveConfiguration(_what, _path, _configuration)
)

const getMongoUrlFromTaskArgs = taskArgs =>
  taskArgs[TASK_FLAG_MONGO_LOCALHOST] ? 'mongodb://localhost:27017' : 'mongodb://mongodb:27017'

const generateListenerConfiguration = (taskArgs, hre) =>
  Promise.all([getPRouterAddress(hre), getNetworkId(hre)]).then(
    ([_pRouterAddress, _networkId]) => ({
      [constants.config.KEY_CHAIN_TYPE]: 'EVM',
      [constants.config.KEY_NETWORK_ID]: _networkId,
      [constants.config.KEY_CHAIN_NAME]: hre.network.name,
      [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
      [constants.config.KEY_EVENTS]: [
        {
          [constants.config.KEY_CONTRACTS]: [_pRouterAddress],
          [constants.config.KEY_NAME]: constants.evm.events.USER_OPERATION_SIGNATURE,
        },
      ],
      [constants.config.KEY_DB]: {
        [constants.config.KEY_NAME]: 'listener',
        [constants.config.KEY_TABLE_EVENTS]: 'events',
        [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
      },
    })
  )

const generateRequestProcessorConfiguration = (taskArgs, hre) =>
  Promise.all([getStateManagerAddress(hre), getNetworkId(hre)]).then(
    ([_stateManagerAddress, _networkId]) => ({
      [constants.config.KEY_CHAIN_TYPE]: 'EVM',
      [constants.config.KEY_CHALLENGE_PERIOD]: 1, // FIXME
      [constants.config.KEY_NETWORK_ID]: _networkId,
      [constants.config.KEY_CHAIN_NAME]: hre.network.name,
      [constants.config.KEY_STATE_MANAGER]: _stateManagerAddress,
      [constants.config.KEY_IDENTITY_GPG]: '/usr/src/app/private-key',
      [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
      [constants.config.KEY_DB]: {
        [constants.config.KEY_NAME]: 'listener',
        [constants.config.KEY_TABLE_EVENTS]: 'events',
        [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
      },
    })
  )

const saveRelayerProcessorConfiguration = (taskArgs, hre) =>
  generateRequestProcessorConfiguration(taskArgs, hre).then(
    maybeSaveConfiguration(
      taskArgs,
      'Request Processor',
      `${PATH_TO_RELAYER_APP}/${hre.network.name}.processor.config.json`
    )
  )

const saveRelayerListenerConfiguration = (taskArgs, hre) =>
  generateListenerConfiguration(taskArgs, hre).then(
    maybeSaveConfiguration(
      taskArgs,
      'Listener',
      `${PATH_TO_RELAYER_APP}/${hre.network.name}.listener.config.json`
    )
  )

const generateRelayerConfigurationTask = (taskArgs, hre) =>
  saveRelayerListenerConfiguration(taskArgs, hre).then(_ =>
    saveRelayerProcessorConfiguration(taskArgs, hre)
  )

task(
  TASK_NAME_APPS_GENERATE_RELAYER,
  TASK_DESC_APPS_GENERATE_RELAYER,
  generateRelayerConfigurationTask
)
  .addFlag(TASK_FLAG_SHOW, TASK_FLAG_SHOW_DESC)
  .addFlag(TASK_FLAG_MONGO_LOCALHOST, TASK_FLAG_MONGO_LOCALHOST_DESC)
