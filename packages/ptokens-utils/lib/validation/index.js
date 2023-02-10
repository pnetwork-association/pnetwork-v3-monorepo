const checkType = require('./check-type')
const schemaValidation = require('./schema-validation')

module.exports = {
  ...checkType,
  ...schemaValidation,
}