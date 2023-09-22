const R = require('ramda')
const path = require('path')
const fs = require('node:fs/promises')
const constants = require('ptokens-constants')
const { getNetworkId, getHubAddress } = require('../lib/configuration-manager')

const TASK_FLAG_SHOW = 'show'
const TASK_FLAG_SHOW_DESC = 'Show result instead of saving it to a file'
const TASK_FLAG_MONGO_LOCALHOST = 'localhost'
const TASK_FLAG_MONGO_LOCALHOST_DESC = 'Set localhost into the mongo url (good for testing)'
const TASK_NAME_APPS_GENERATE_CONFIGURATIONS = 'apps:generate-configs'
const TASK_DESC_APPS_GENERATE_CONFIGURATIONS =
  'Generate Relayer & Guardian configurations from the given network name.'

const PATH_TO_RELAYER_APP = path.join(__dirname, '../../../../apps/ptokens-relayer')
const PATH_TO_GUARDIAN_APP = path.join(__dirname, '../../../../apps/ptokens-guardian')

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

const generateListenerConfiguration = (
  taskArgs,
  hre,
  _networkId,
  _contractAddress,
  _eventSignature
) =>
  Promise.resolve({
    [constants.config.KEY_CHAIN_TYPE]: 'EVM',
    [constants.config.KEY_NETWORK_ID]: _networkId,
    [constants.config.KEY_CHAIN_NAME]: hre.network.name,
    [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
    [constants.config.KEY_EVENTS]: [
      {
        [constants.config.KEY_CONTRACTS]: [_contractAddress],
        [constants.config.KEY_NAME]: _eventSignature,
      },
    ],
    [constants.config.KEY_DB]: {
      [constants.config.KEY_NAME]: 'pnetwork',
      [constants.config.KEY_TABLE_EVENTS]: 'events',
      [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
    },
  })

const generateRequestProcessorConfiguration = (taskArgs, hre, _networkId, _contractAddress) =>
  Promise.all([getHubAddress(hre), getNetworkId(hre)]).then(([_hubAddress, _networkId]) => ({
    [constants.config.KEY_CHAIN_TYPE]: 'EVM',
    [constants.config.KEY_CHALLENGE_PERIOD]: 1, // FIXME
    [constants.config.KEY_NETWORK_ID]: _networkId,
    [constants.config.KEY_CHAIN_NAME]: hre.network.name,
    [constants.config.KEY_HUB_ADDRESS]: _contractAddress,
    [constants.config.KEY_IDENTITY_GPG]: '/usr/src/app/private-key',
    [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
    [constants.config.KEY_DB]: {
      [constants.config.KEY_NAME]: 'pnetwork',
      [constants.config.KEY_TABLE_EVENTS]: 'events',
      [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
    },
  }))

const saveRelayerListenerConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateListenerConfiguration(
    taskArgs,
    hre,
    _networkId,
    _hubAddress,
    constants.evm.events.USER_OPERATION_SIGNATURE
  ).then(
    maybeSaveConfiguration(
      taskArgs,
      'Relayer listener',
      `${PATH_TO_RELAYER_APP}/${hre.network.name}.listener.config.json`
    )
  )

const saveRelayerProcessorConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateRequestProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress).then(
    maybeSaveConfiguration(
      taskArgs,
      'Relayer processor',
      `${PATH_TO_RELAYER_APP}/${hre.network.name}.processor.config.json`
    )
  )

const saveGuardianRequestListenerConfiguration = (taskArgs, hre, _networkId, _pRouterAddress) =>
  generateListenerConfiguration(
    taskArgs,
    hre,
    _networkId,
    _pRouterAddress,
    constants.evm.events.USER_OPERATION_SIGNATURE
  ).then(
    maybeSaveConfiguration(
      taskArgs,
      'Guardian request listener',
      `${PATH_TO_GUARDIAN_APP}/${hre.network.name}.listener.requests.config.json`
    )
  )

const saveGuardianQueueListenerConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateListenerConfiguration(
    taskArgs,
    hre,
    _networkId,
    _hubAddress,
    constants.evm.events.OPERATION_QUEUED_SIGNATURE
  ).then(
    maybeSaveConfiguration(
      taskArgs,
      'Guardian queue listener',
      `${PATH_TO_GUARDIAN_APP}/${hre.network.name}.listener.queue.config.json`
    )
  )

const saveGuardianProcessorConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateRequestProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress).then(
    maybeSaveConfiguration(
      taskArgs,
      'Guardian processor',
      `${PATH_TO_GUARDIAN_APP}/${hre.network.name}.processor.config.json`
    )
  )

const generateRelayerConfigurationTask = (taskArgs, hre) =>
  Promise.all([getNetworkId(hre), getHubAddress(hre)]).then(([_networkId, _hubAddress]) =>
    Promise.all([
      saveRelayerListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveRelayerProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianRequestListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianQueueListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress),
    ])
  )

task(
  TASK_NAME_APPS_GENERATE_CONFIGURATIONS,
  TASK_DESC_APPS_GENERATE_CONFIGURATIONS,
  generateRelayerConfigurationTask
)
  .addFlag(TASK_FLAG_SHOW, TASK_FLAG_SHOW_DESC)
  .addFlag(TASK_FLAG_MONGO_LOCALHOST, TASK_FLAG_MONGO_LOCALHOST_DESC)
