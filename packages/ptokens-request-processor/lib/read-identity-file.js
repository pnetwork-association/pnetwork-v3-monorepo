const { readFile } = require('fs/promises')
const { logger } = require('./get-logger')

const readIdentityFile = _identityFile =>
  // TODO: replace this implementation with ptokens-utils readGpgEncryptedFile()
  logger.warn('FIXME: READING PRIV KEY IN CLEAR TEXT') ||
  readFile(_identityFile, { encoding: 'utf8' }).then(_s => _s.trim())

module.exports = { readIdentityFile }
