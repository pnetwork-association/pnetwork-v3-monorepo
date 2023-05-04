const R = require('ramda')
const Store = require('data-store')
const PATH_CONFIG_FILE = '/deployments.json'
const {
  KEY_PTOKEN_ADDRESS,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_UNDERLYING_ADDRESS,
} = require('../../constants')

const getConfiguration = () => Promise.resolve(Store({ path: process.cwd() + PATH_CONFIG_FILE }))

const updateConfiguration = (...vargs) =>
  new Promise(resolve => {
    const config = vargs.at(0)
    const valueArgIndex = -1
    const typeArgIndex = -2
    const value = vargs.at(valueArgIndex)
    const args = R.slice(1, valueArgIndex, vargs)

    if (vargs.at(typeArgIndex) == KEY_PTOKEN_ADDRESS) {
      const path = args.reduce((acc, cur) => acc + '.' + KEY_PTOKEN_LIST)
      config.union(path, value)
    } else if (vargs.at(typeArgIndex) == KEY_UNDERLYING_ADDRESS) {
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
