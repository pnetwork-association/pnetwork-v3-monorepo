const slashActorModule = require('./slash-actor')
const startChallenge = require('./start-challenge')
const estimateBlockTimesModule = require('./estimate-block-time')
const getActorsModule = require('./get-actors-for-current-epoch')
const getChallengerLockAmountsModule = require('./get-lock-amounts')
const getChallengeDurationsModule = require('./get-challenge-durations')

module.exports = {
  ...startChallenge,
  ...getActorsModule,
  ...slashActorModule,
  ...estimateBlockTimesModule,
  ...getChallengeDurationsModule,
  ...getChallengerLockAmountsModule,
}
