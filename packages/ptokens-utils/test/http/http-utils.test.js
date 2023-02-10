const assert = require('assert')
const jsonrpc = require('jsonrpc-lite')
const {
  createServer,
  MOCK_SERVER_REQUEST_FAILED
} = require('./server')
const { http, errors } = require('../..')

describe('Http general tests', () => {
  let server
  const port = 3000
  const serverUrl = `http://localhost:${port}`

  before(async () => {
    server = await createServer()

    /* eslint-disable no-empty-function */
    await server.listen(3000, '127.0.0.1', () => {})
  })

  after(() => {
    server.close()
  })

  describe('fetchJsonByGet', () => {
    it('Should not reject performing a GET request', async () => {
      const result = await http.fetchJsonByGet(`${serverUrl}/hello`, {}, 1000)
      const expected = { Hello: 'World' }
      
      assert.deepStrictEqual(result, expected)
    })

    it('Should abort the GET request after the specified timeout', async () => {
      try {
        await http.fetchJsonByGet(`${serverUrl}/hello`, {}, 100)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_TIMEOUT))
      }
    })

    it('Should reject with the correct error when the data is not a JSON', async () => {
      try {
        await http.fetchJsonByGet(`${serverUrl}/no-json`)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes('invalid json response body'))
      }
    })

    it('Should reject when the HTTP status is not within 200-300', async () => {
      try {
        await http.fetchJsonByGet(`${serverUrl}/404`)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_UNEXPECTED_HTTP_STATUS))
      }
    })
  })

  describe('fetchJsonByPost', () => {
    it('Should not reject returning the correct response', async () => {
      const body = { 'hello': 'world' }
      const result = await http.fetchJsonByPost(`${serverUrl}/hello-post`, body)

      assert.deepStrictEqual(result, body)
    })

    it('Should abort the request after the specified timeout', async () => {
      try {
        const body = { 'hello': 'world' }
        await http.fetchJsonByPost(`${serverUrl}/hello-post`, body, {}, 100)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes(errors.ERROR_TIMEOUT))
      }
    })

    it('Should get an error including the correct response', async () => {
      try {
        await http.fetchJsonByPost(`${serverUrl}/json-rpc-fail`, {})
        assert.fail('Should never reach here')
      } catch (err) {
        const resp = await err.response.json()
        assert.deepStrictEqual(resp.result, MOCK_SERVER_REQUEST_FAILED)
        assert(err.message.includes(errors.ERROR_UNEXPECTED_HTTP_STATUS))
      }
    })
  })

  describe('jsonRpcFetch', () => {
    it('Should not reject returning the correct response', async () => {
      const id = '1'
      const method = 'method'
      const body = jsonrpc.request(id, method)
      const result = await http.jsonRpcFetch(`${serverUrl}/json-rpc`, body)
      const expected = { jsonrpc: '2.0', id: id, result: 'Fine!'}

      assert.deepStrictEqual(result, expected)
    })
  })
})