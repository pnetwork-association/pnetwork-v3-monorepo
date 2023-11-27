const R = require('ramda')
const validation = require('../validation')

module.exports.mapAll = R.curry((_promiseFn, _list) =>
  validation.checkType('Array', _list).then(_ => Promise.all(_list.map(_promiseFn)))
)
