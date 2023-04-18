const tick = require('./bench-tick')
const fsUtils = require('./utils-fs')
const dateUtils = require('./utils-date')
const ramdaExtUtils = require('./utils-ramda-ext')
const regexpUtils = require('./utils-regexp')
const randomUtils = require('./utils-random')
const objectUtils = require('./utils-objects')
const getChainSymbol = require('./get-chain-symbol')
const networkIdUtils = require('./utils-network-id')
const getEventId = require('./get-event-id')

module.exports = {
  ...fsUtils,
  ...regexpUtils,
  ...randomUtils,
  ...objectUtils,
  ...ramdaExtUtils,
  ...getChainSymbol,
  ...networkIdUtils,
  bench: tick,
  date: dateUtils,
  ...getEventId,
}
