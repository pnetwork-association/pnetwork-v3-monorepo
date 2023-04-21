const { checkConfiguration } = require('../check-configuration')
const { setupExitEventListeners } = require('../setup-exit-listeners')

const { listenForEvents } = require('../interfaces/listen-for-events')
const { getInitialStateFromConfiguration } = require('../populate-state-from-configuration')

const listenForEventsCommand = _config =>
  setupExitEventListeners()
    .then(_ => checkConfiguration(_config))
    .then(getInitialStateFromConfiguration)
    .then(listenForEvents)

module.exports = { listenForEventsCommand }
