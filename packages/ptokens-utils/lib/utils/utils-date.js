const R = require('ramda')
const validation = require('../validation')

const addMinutesToDate = R.curry((_minutes, _dateObject) =>
  validation.checkType('Date', _dateObject).then(_ => {
    _dateObject.setUTCMinutes(_dateObject.getUTCMinutes() + _minutes)
    return _dateObject
  })
)

module.exports = {
  addMinutesToDate,
}
