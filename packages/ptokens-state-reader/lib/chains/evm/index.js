const estimateBlockTimesModule = require('./estimate-block-time')
const getActorsModule = require('./get-actors-for-current-epoch')

module.exports = {
  ...getActorsModule,
  ...estimateBlockTimesModule,
}
