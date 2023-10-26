const slashActorModule = require('./slash-actor')
const startChallenge = require('./start-challenge')
const estimateBlockTimesModule = require('./estimate-block-time')
const getActorsModule = require('./get-actors-for-current-epoch')
const getChallengerLockAmountsModule = require('./get-lock-amounts')

module.exports = {
  ...startChallenge,
  ...getActorsModule,
  ...slashActorModule,
  ...estimateBlockTimesModule,
  ...getChallengerLockAmountsModule,
}
