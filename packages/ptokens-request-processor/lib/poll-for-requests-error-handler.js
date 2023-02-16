const { curry } = require('ramda')
const { logger } = require('./get-logger')

const pollForRequestsErrorHandler = curry((_pollForRequestsLoop, _err) => {
  logger.error(_err)
  return Promise.reject(new Error('Function not implemented!'))
})

module.exports = {
  pollForRequestsErrorHandler,
}
