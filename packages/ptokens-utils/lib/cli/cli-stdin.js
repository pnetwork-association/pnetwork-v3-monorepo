const R = require('ramda')
const inquirer = require('inquirer')

const askUserToSelectOption = R.curry((_promptTxt, _options) =>
  inquirer
    .prompt({
      type: 'list',
      name: 'selection',
      choices: _options,
      message: _promptTxt,
    })
    .then(({ selection }) => selection)
)

const maybeAskUserToSelectOption = R.curry(
  (_promptTxt, _errIfNotFoundAny, _options) =>
    _options.length === 0
      ? Promise.reject(new Error(_errIfNotFoundAny))
      : _options.length === 1
      ? Promise.resolve(_options[0])
      : askUserToSelectOption(_promptTxt, _options)
)

module.exports = {
  askUserToSelectOption,
  maybeAskUserToSelectOption,
}
