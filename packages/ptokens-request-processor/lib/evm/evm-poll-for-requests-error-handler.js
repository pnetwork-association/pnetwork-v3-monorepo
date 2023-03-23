const { curry } = require('ramda')

const pollForRequestsErrorHandler = curry((_pollForRequestsLoop, _err) => {
  return Promise.reject(_err)
})

module.exports = {
  pollForRequestsErrorHandler,
}
