const R = require('ramda')
const path = require('path')
const fs = require('node:fs/promises')
const constants = require('ptokens-constants')
const pTokensUtils = require('ptokens-utils')
const {
  getNetworkId,
  getHubAddress,
  getGovernanceMessageEmitterAddress,
} = require('../lib/configuration-manager')

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

const addActorsPropagatedEvent = R.curry((_config, _governanceMessageEmitterAddress) => {
  const obj = {
    [constants.config.KEY_CONTRACT]: _governanceMessageEmitterAddress,
    [constants.config.KEY_SIGNATURES]: [constants.evm.events.ACTORS_PROPAGATED_SIGNATURE],
  }

  const events = _config[constants.config.KEY_EVENTS]

  events.push(obj)
  return Promise.resolve(R.assoc(constants.config.KEY_EVENTS, events, _config))
})

const addGovernanceMessageEmitterEvent = R.curry((taskArgs, hre, _networkId, _config) =>
  getGovernanceMessageEmitterAddress(hre).then(addActorsPropagatedEvent(_config))
)

const maybeAddGovernanceMessageEmitterEvents = R.curry((taskArgs, hre, _networkId, _config) =>
  _networkId === pTokensUtils.constants.networkIds.POLYGON_MAINNET
    ? addGovernanceMessageEmitterEvent(taskArgs, hre, _networkId, _config)
    : Promise.resolve(_config)
)

const generateListenerConfiguration = (taskArgs, hre, _networkId, _events) =>
  Promise.resolve({
    [constants.config.KEY_CHAIN_TYPE]: 'EVM',
    [constants.config.KEY_NETWORK_ID]: _networkId,
    [constants.config.KEY_CHAIN_NAME]: hre.network.name,
    [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
    [constants.config.KEY_EVENTS]: _events.map(_event => ({
      [constants.config.KEY_CONTRACT]: _event.contracts,
      [constants.config.KEY_SIGNATURES]: _event.topics,
    })),
    [constants.config.KEY_DB]: {
      [constants.config.KEY_NAME]: 'pnetwork',
      [constants.config.KEY_TABLE_EVENTS]: 'events',
      [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
    },
  })
    // FIXME: add component name to the args and add the event only
    // in the case of a guardian
    .then(maybeAddGovernanceMessageEmitterEvents(taskArgs, hre, _networkId))

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
  generateListenerConfiguration(taskArgs, hre, _networkId, [
    { contracts: _hubAddress, topics: [constants.evm.events.USER_OPERATION_SIGNATURE] },
  ]).then(
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

const saveGuardianListenerConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  console.info('_hubAddress', _hubAddress) ||
  generateListenerConfiguration(taskArgs, hre, _networkId, [
    {
      contracts: _hubAddress,
      topics: [
        constants.evm.events.USER_OPERATION_SIGNATURE,
        constants.evm.events.OPERATION_QUEUED_SIGNATURE,
      ],
    },
  ]).then(
    maybeSaveConfiguration(
      taskArgs,
      'Guardian listener',
      `${PATH_TO_GUARDIAN_APP}/${hre.network.name}.listener.config.json`
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

const generateConfigurationTask = (taskArgs, hre) =>
  Promise.all([getNetworkId(hre), getHubAddress(hre)]).then(([_networkId, _hubAddress]) =>
    Promise.all([
      saveRelayerListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveRelayerProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress),
    ])
  )

task(
  TASK_NAME_APPS_GENERATE_CONFIGURATIONS,
  TASK_DESC_APPS_GENERATE_CONFIGURATIONS,
  generateConfigurationTask
)
  .addFlag(TASK_FLAG_SHOW, TASK_FLAG_SHOW_DESC)
  .addFlag(TASK_FLAG_MONGO_LOCALHOST, TASK_FLAG_MONGO_LOCALHOST_DESC)
