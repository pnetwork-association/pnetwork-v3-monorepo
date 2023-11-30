const http = require('../http')
const PubSub = require('./pubsub')
const { ERROR_IPFS_DAEMON_DOWN } = require('../errors')
const { FetchError } = require('node-fetch')
const { rejectIfNil } = require('../utils')

class IPFSProvider {
  constructor(url) {
    this.url = url
  }

  id() {
    return http.fetchJsonByPost(`${this.url}/api/v0/id`, {})
  }

  checkDaemon() {
    return this.id()
      .then(rejectIfNil(ERROR_IPFS_DAEMON_DOWN))
      .catch(_err =>
        _err instanceof FetchError
          ? Promise.reject(new Error(ERROR_IPFS_DAEMON_DOWN))
          : Promise.reject(_err)
      )
  }
}

module.exports = {
  IPFSProvider,
  PubSub,
}
