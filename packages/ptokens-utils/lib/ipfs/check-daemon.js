const R = require('ramda')
const { id } = require('./id')

const ERROR_IPFS_DAEMON_DOWN =
  "IPFS daemon not running! (Run 'ipfs init' and then 'ipfs daemon' first)"

module.exports.checkDaemon = () =>
  id()
    .then(_json => Promise.all([R.prop('Addresses', _json), R.prop('Protocols', _json)]))
    .then(R.all(R.isNil))
    .then(_check => (_check ? Promise.reject(new Error(ERROR_IPFS_DAEMON_DOWN)) : _check))
