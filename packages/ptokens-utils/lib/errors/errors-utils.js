const R = require('ramda')

const stringifyAggregatedError = _errors =>
  _errors['errors'].reduce((acc, cur) => acc + `  ${cur}\n`, 'AggregatedError:\n')

const stringifyErrors = _errors =>
  _errors instanceof AggregateError && R.has('errors', _errors)
    ? stringifyAggregatedError(_errors)
    : _errors

const stringifyErrorsAndReject = _errors => Promise.reject(stringifyErrors(_errors))

// Deprecated
const maybeExpandAggregatedErrorSync = _maybeErrors => stringifyErrors(_maybeErrors)

// Deprecated
const maybeExpandAggregatedErrorAndReject = _maybeErrors => stringifyErrorsAndReject(_maybeErrors)

module.exports = {
  stringifyErrors,
  stringifyErrorsAndReject,
  maybeExpandAggregatedErrorSync,
  maybeExpandAggregatedErrorAndReject,
}
