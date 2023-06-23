const R = require('ramda')

const rejectIfNil = R.curry((_errMsg, _thing) =>
  R.isNil(_thing) ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_thing)
)

module.exports = {
  rejectIfNil,
}
