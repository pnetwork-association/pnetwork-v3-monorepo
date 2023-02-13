const db = require('./lib/db')
const cli = require('./lib/cli')
const http = require('./lib/http')
const web3 = require('./lib/web3')
const logic = require('./lib/logic')
const utils = require('./lib/utils')
const logger = require('./lib/logger')
const errors = require('./lib/errors')
const enclave = require('./lib/enclave')
const constants = require('./lib/constants')
const validation = require('./lib/validation')
const bridgeTypes = require('./lib/bridge-types')

const ptokensUtils = {
  db: db,
  cli: cli,
  web3: web3,
  http: http,
  utils: utils,
  logic: logic,
  errors: errors,
  logger: logger,
  enclave: enclave,
  constants: constants,
  validation: validation,
  bridgeTypes: bridgeTypes,
}

module.exports = ptokensUtils
