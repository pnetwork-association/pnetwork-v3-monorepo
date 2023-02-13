const { any, map, curry, equals } = require('ramda')

const applyRegExpToListOfStrings = curry((_regexp, _list) =>
  _list.filter(_str => _regexp.test(_str))
)

const matchStringInsideListSync = curry((_listOfRegexp, _stringToMatch) => {
  const regexps = _listOfRegexp.map(_err => new RegExp(_err))
  const applyRegexp = _regexp => _regexp.test(_stringToMatch)

  return any(equals(true), map(applyRegexp, regexps))
})

module.exports = {
  matchStringInsideListSync,
  applyRegExpToListOfStrings,
}
