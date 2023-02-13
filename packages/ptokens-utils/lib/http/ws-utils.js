const { curry, identity, memoizeWith } = require('ramda')
const {
  ERROR_TIMEOUT,
  ERROR_WEBSOCKET_REQUEST_TIMEOUT,
  ERROR_WEBSOCKET_CONNECTION_FAILURE,
} = require('../errors')
const { WebSocket } = require('ws')
const { logger } = require('../logger')
const { rejectAfterXMilliseconds } = require('../logic')

const defineOpenEventHandler = _ws =>
  new Promise((resolve, reject) => {
    _ws.on('open', resolve)
    _ws.on('error', reject)
    _ws.on('close', reject)
  }).then(() => logger.info('Websocket connection opened!') || _ws)

const defineMessageEventHandler = _ws =>
  new Promise(resolve => _ws.on('message', resolve)).then(
    _resp => logger.debug("Websocket 'message' event handler defined") || _resp
  )

const promisifiedWebSocketSend = (_ws, _data) =>
  new Promise((resolve, reject) =>
    _ws.send(_data, _err =>
      _err instanceof Error
        ? reject(_err)
        : logger.trace(`Websocket data sent: ${_data}`) || resolve(_ws)
    )
  )

const handleWebSocketError = _err =>
  new Promise((resolve, reject) => {
    switch (_err.code) {
      case 'ECONNREFUSED':
        return reject(new Error(ERROR_WEBSOCKET_CONNECTION_FAILURE))
      default:
        return reject(_err)
    }
  })

const getWebSocketConnection = memoizeWith(identity, _endpoint =>
  Promise.resolve(new WebSocket(_endpoint))
    .then(defineOpenEventHandler)
    .catch(handleWebSocketError)
)

const webSocketSend = (_ws, _body, _timeout = 500) =>
  Promise.race([
    promisifiedWebSocketSend(_ws, _body),
    rejectAfterXMilliseconds(_timeout),
  ])
    .then(defineMessageEventHandler)
    .then(Buffer.from)
    .then(String)
    .catch(_err =>
      _err.message.includes(ERROR_TIMEOUT)
        ? Promise.reject(ERROR_WEBSOCKET_REQUEST_TIMEOUT)
        : Promise.reject(_err)
    )

const webSocketFetch = curry((_endpoint, _body, _timeout = 500) =>
  getWebSocketConnection(_endpoint).then(_ws =>
    webSocketSend(_ws, _body, _timeout)
  )
)

const webSocketClose = _endpoint =>
  getWebSocketConnection(_endpoint)
    .then(_ws => _ws.close() || _ws)
    .then(_ws => logger.info('WebSocket connection closed!') || _ws)

module.exports = {
  webSocketFetch,
  webSocketClose,
  getWebSocketConnection,
}
