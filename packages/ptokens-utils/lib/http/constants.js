const jsonrpc = require('jsonrpc-lite')

module.exports = {
  ERROR_SERVER_ERROR: new jsonrpc.JsonRpcError('Server error', -32000),
}
