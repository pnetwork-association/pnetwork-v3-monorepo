const R = require('ramda')

const applyRegExpToListOfStrings = R.curry((_regexp, _list) =>
  _list.filter(_str => _regexp.test(_str))
)

const matchStringInsideListSync = R.curry((_listOfRegexp, _stringToMatch) => {
  const regexps = _listOfRegexp.map(_err => new RegExp(_err))
  const applyRegexp = _regexp => _regexp.test(_stringToMatch)

  return R.any(R.equals(true), R.map(applyRegexp, regexps))
})

module.exports = {
  matchStringInsideListSync,
  applyRegExpToListOfStrings,
}
