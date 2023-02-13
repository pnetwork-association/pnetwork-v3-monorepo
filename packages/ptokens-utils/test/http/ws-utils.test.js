const assert = require('assert')
const { WebSocketServer } = require('ws')
const { http, errors } = require('../..')

const createWebSocketServer = (_port = 10000) =>
  Promise.resolve(new WebSocketServer({ port: _port })).then(_wss => {
    _wss.on('connection', _ws => {
      // console.log('Server: connected')
      _ws.on('message', _data => {
        // console.log('Server: sending', Buffer.from(_data).toString())
        _ws.send(_data)
      })
      _ws.on('close', () => {
        // console.log('Server: closed')
      })
    })
    return _wss
  })

const getWebSocketUrl = (_port = 10000) => `ws://localhost:${_port}`

describe('WebSocket tests', () => {
  let server, connection
  before(async () => {
    server = await createWebSocketServer()
  })

  after(async () => {
    for (const client of server.clients) await client.close()

    await server.close()
  })

  describe('getWebSocketConnection', () => {
    it('Should not reject getting the WebSocket connection', async () => {
      connection = await http.getWebSocketConnection(getWebSocketUrl())

      assert(connection)
    })
  })

  describe('webSocketFetch', () => {
    it('Should not reject receiving WebSocket server responses', async () => {
      const data = ['blabla', 'hello', 'world']

      for (let i = 0; i < data.length; ++i) {
        const result = await http.webSocketFetch(getWebSocketUrl(), data[i])
        assert.deepStrictEqual(result, data[i])
      }
    })
  })

  describe('webSocketClose', () => {
    it('Should close the connection successfully', async () => {
      const port = 10002
      const url = getWebSocketUrl(port)
      const mockServer = await createWebSocketServer(port)

      const ws = await http.webSocketClose(url)

      assert(ws)

      mockServer.close()
    })
  })

  describe('Edge cases', () => {
    it('Should reject if the server connection has been closed', async function () {
      this.timeout(3000) // needs 'function', not lambda
      const port = 10001
      const url = getWebSocketUrl(port)
      const mockServer = await createWebSocketServer(port)

      mockServer.close()

      try {
        await http.webSocketFetch(url, 'Should fail')
        assert.fail()
      } catch (err) {
        assert.deepStrictEqual(
          err.message,
          errors.ERROR_WEBSOCKET_CONNECTION_FAILURE
        )
      }
    })
  })
})
