const tick = require('./bench-tick')
const fsUtils = require('./utils-fs')
const dateUtils = require('./utils-date')
const promises = require('./utils-promises')
const ramdaExtUtils = require('./utils-ramda-ext')
const regexpUtils = require('./utils-regexp')
const randomUtils = require('./utils-random')
const objectUtils = require('./utils-objects')
const getChainSymbol = require('./get-chain-symbol')
const networkIdUtils = require('./utils-network-id')
const getEventId = require('./get-event-id')
const getMerkleProofUtil = require('./get-merkle-proof')
const readIdentityFileUtil = require('./read-identity-file')

module.exports = {
  ...fsUtils,
  ...regexpUtils,
  ...randomUtils,
  ...objectUtils,
  ...ramdaExtUtils,
  ...getChainSymbol,
  ...networkIdUtils,
  ...readIdentityFileUtil,
  promises,
  bench: tick,
  date: dateUtils,
  ...getEventId,
  ...getMerkleProofUtil,
}
