const config = require('./config.json')
const constants = require('ptokens-constants')
const { logger } = require('./lib/get-logger')
const { validation } = require('ptokens-utils')
const { setupExitEventListeners } = require('./lib/setup-exit-listeners')
const { signStatusObjectAndAddToState } = require('./lib/interfaces/sign-state-object')
const { publishStatusObjectAndReturnState } = require('./lib/interfaces/publish-status-object')
const { buildStatusObjectAndAddToState } = require('./lib/interfaces/build-status-object')

const initializeStateFromConfiguration = _config =>
  Promise.resolve(validation.validateJson(constants.config.schemas.stateEmitter, _config)).then(
    _ => _config
  )

const cycle = _config =>
  initializeStateFromConfiguration(_config) // will copy the config key/values into the state (for speed sake)
    .then(buildStatusObjectAndAddToState)
    .then(signStatusObjectAndAddToState)
    .then(publishStatusObjectAndReturnState)
    .catch(_err => logger.error(_err) || process.exit(1))

const main = _config =>
  setupExitEventListeners().then(_ => setInterval(cycle, _config.interval || 4000, _config))

main(config)
