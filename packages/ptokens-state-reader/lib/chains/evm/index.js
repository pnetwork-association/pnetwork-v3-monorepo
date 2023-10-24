const estimateBlockTimesModule = require('./estimate-block-time')
const estimateThresholdsModule = require('./estimate-thresholds')

module.exports = {
  ...estimateBlockTimesModule,
  ...estimateThresholdsModule,
}
