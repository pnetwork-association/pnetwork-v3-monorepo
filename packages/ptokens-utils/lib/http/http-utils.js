const {
  ERROR_TIMEOUT,
  ERROR_SERVER_ERROR,
  HTTPResponseError,
} = require('../errors')
const fetch = require('node-fetch')
const jsonrpc = require('jsonrpc-lite')
const R = require('ramda')
const { logger } = require('../logger')

const setControllerTimeout = R.curry((_millis, _controller) =>
  Promise.resolve(
    setTimeout(() => {
      _controller.abort()
      logger.trace(`Timeout set to ${_millis}`)
    }, _millis)
  ).then(_timeoutID => [_controller, _timeoutID])
)

const getAbortControllerAndTimeoutID = _timeoutMillis =>
  Promise.resolve(new AbortController()).then(
    setControllerTimeout(_timeoutMillis)
  )

const fetchWithAbort = (_url, _opts, _controller, _timeoutID) =>
  fetch(_url, { ..._opts, signal: _controller.signal })
    .catch(_err =>
      _err.name && _err.name === 'AbortError'
        ? logger.debug(_err) || Promise.reject(new Error(ERROR_TIMEOUT + _url))
        : Promise.reject(_err)
    )
    .finally(() => {
      clearTimeout(_timeoutID)
      logger.debug(`Controller timeout ${_timeoutID} cleared!`)
    })

const postRequest = (_url, _body, _headers = {}, _timeout = 1000) =>
  Promise.all([
    JSON.stringify(_body),
    getAbortControllerAndTimeoutID(_timeout),
  ]).then(
    ([_bodyStr, [_controller, _timeoutID]]) =>
      logger.info(`Outgoing POST ${_bodyStr} to ${_url}`) ||
      fetchWithAbort(
        _url,
        {
          method: 'post',
          body: _bodyStr,
          headers: _headers,
        },
        _controller,
        _timeoutID
      )
  )

const getRequest = (_url, _headers = {}, _timeout = 1000) =>
  logger.debug(`Outgoing GET ${_url}`) ||
  getAbortControllerAndTimeoutID(_timeout).then(([_controller, _timeoutID]) =>
    fetchWithAbort(_url, { headers: _headers }, _controller, _timeoutID)
  )

const getJsonBody = _resp => _resp.json()

const checkStatus = _resp =>
  _resp.ok
    ? Promise.resolve(_resp)
    : Promise.reject(new HTTPResponseError(_resp))

const fetchJsonByGet = (_url, _headers = {}, _timeout = 1000) =>
  getRequest(_url, _headers, _timeout).then(checkStatus).then(getJsonBody)

const fetchJsonByPost = (_url, _body, _headers = {}, _timeout = 5000) =>
  postRequest(_url, _body, _headers, _timeout)
    .then(checkStatus)
    .then(getJsonBody)

const plainJsonResponse = R.curry((_res, _result) =>
  _res.status(200).send(_result)
)

const jsonRpcSuccess = R.curry((_req, _res, _result) =>
  _res.send(jsonrpc.success(_req.body.id, _result))
)

const jsonRpcError = R.curry((_req, _res, _err) => {
  const id = _req.body.id ? _req.body.id : 0
  return _res.send(
    _err instanceof jsonrpc.JsonRpcError
      ? jsonrpc.error(id, _err)
      : R.has('code', _err) && R.has('message', _err)
      ? jsonrpc.error(id, new jsonrpc.JsonRpcError(_err.message, _err.code))
      : jsonrpc.error(id, ERROR_SERVER_ERROR)
  )
})

const jsonRpcFetch = (
  _url,
  _jsonRpcRequest,
  _headers = {},
  _timeout = 1000
) => {
  const headers = {
    'Content-Type': 'application/json',
    ..._headers,
  }

  return fetchJsonByPost(_url, _jsonRpcRequest, headers, _timeout)
}

module.exports = {
  getRequest,
  postRequest,
  jsonRpcFetch,
  jsonRpcError,
  jsonRpcSuccess,
  fetchJsonByGet,
  fetchJsonByPost,
  plainJsonResponse,
}
