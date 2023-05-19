const R = require('ramda')
const Store = require('data-store')
const PATH_CONFIG_FILE = '/deployments.json'
const { KEY_PTOKEN_LIST, KEY_UNDERLYING_ASSET_LIST } = require('../../constants')

const getConfiguration = () => Promise.resolve(Store({ path: process.cwd() + PATH_CONFIG_FILE }))

const PROPERTIES_REQUIRING_UNION = [KEY_PTOKEN_LIST, KEY_UNDERLYING_ASSET_LIST]

const updateConfiguration = (...vargs) =>
  new Promise(resolve => {
    const config = vargs.at(0)
    const valueArgIndex = -1
    const typeArgIndex = -2
    const value = vargs.at(valueArgIndex)
    const args = R.slice(1, valueArgIndex, vargs)
    const propertyChangingValue = vargs.at(typeArgIndex)
    const path = args.reduce((acc, cur) => acc + '.' + cur)

    if (R.includes(propertyChangingValue, PROPERTIES_REQUIRING_UNION)) config.union(path, value)
    else config.set(path, value)

    return resolve(config)
  })

module.exports = {
  getConfiguration,
  updateConfiguration,
}
