const { ERROR_UNEXPECTED_HTTP_STATUS } = require('./constants')

class HTTPResponseError extends Error {
  constructor(_response) {
    super(`${ERROR_UNEXPECTED_HTTP_STATUS} - '${_response.status} ${_response.statusText}'`)
    this.response = _response
  }
}

module.exports = {
  HTTPResponseError,
}
