const estimateBlockTimesModule = require('./estimate-block-time')
const getActorsModule = require('./get-actors-for-current-epoch')
const getChallengerLockAmountsModule = require('./get-lock-amounts')

module.exports = {
  ...getActorsModule,
  ...estimateBlockTimesModule,
  ...getChallengerLockAmountsModule,
}
