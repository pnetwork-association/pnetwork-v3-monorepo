const R = require('ramda')
const Store = require('data-store')
const PATH_CONFIG_FILE = '/deployments.json'
const {
  CONTRACT_NAME_PTOKEN,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
  CONTRACT_NAME_UNDERLYING_ASSET,
} = require('../../constants')

const getConfiguration = () => Promise.resolve(Store({ path: process.cwd() + PATH_CONFIG_FILE }))

const updateConfiguration = (...vargs) =>
  new Promise(resolve => {
    const config = vargs.at(0)
    const valueArgIndex = -1
    const typeArgIndex = -2
    const value = vargs.at(valueArgIndex)
    const args = R.slice(1, valueArgIndex, vargs)

    if (vargs.at(typeArgIndex) == CONTRACT_NAME_PTOKEN) {
      const path = args.reduce((acc, cur) => acc + '.' + KEY_PTOKEN_LIST)
      config.union(path, value)
    } else if (vargs.at(typeArgIndex) == CONTRACT_NAME_UNDERLYING_ASSET) {
      const path = args.reduce((acc, cur) => acc + '.' + KEY_UNDERLYING_ASSET_LIST)
      config.union(path, value)
    } else {
      const path = args.reduce((acc, cur) => acc + '.' + cur)
      config.set(path, value)
    }

    return resolve(config)
  })

module.exports = {
  getConfiguration,
  updateConfiguration,
}
