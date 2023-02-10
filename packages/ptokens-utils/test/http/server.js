const http = require('http')
const { logic } = require('../..')
const jsonrpc = require('jsonrpc-lite')

const MOCK_SERVER_REQUEST_FAILED = 'Request failed!'

const get = async (_req, _res) => {
  switch (_req.url) {
    case '/hello':
      _res.statusCode = 200
      _res.setHeader('Content-Type', 'application/json')
      await logic.sleepForXMilliseconds(200)
      _res.end('{"Hello": "World"}')
      break
    case '/no-json':
      _res.statusCode = 200
      _res.setHeader('Content-Type', 'text/html')
      await logic.sleepForXMilliseconds(200)
      _res.end('hello!')
      break
    case '/404':
      _res.statusCode = 404
      _res.end()
      break
  }  
}

const post = (_req, _res) => {
  let body = ''
  switch (_req.url) {
    case '/hello-post':
      _req.on('data', chunk => {
          body += chunk.toString()
      })
      _req.on('end', async () => {
        _res.statusCode = 200
        _res.setHeader('Content-Type', 'application/json')
        await logic.sleepForXMilliseconds(200)
        _res.end(body)  
      })
      break
    case '/json-rpc':
      _req.on('data', chunk => {
          body += chunk.toString()
      })
      _req.on('end', () => {
        _res.statusCode = 200
        _res.setHeader('Content-Type', 'application/json')
        const obj = JSON.parse(body)
        const resp = jsonrpc.success(obj.id, 'Fine!')
        _res.end(JSON.stringify(resp))
      })
      break
    case '/json-rpc-fail':
      _req.on('data', chunk => {
          body += chunk.toString()
      })
      _req.on('end', () => {
        try {
          _res.statusCode = 500
          _res.setHeader('Content-Type', 'application/json')
          const resp = JSON.stringify(jsonrpc.success(1, MOCK_SERVER_REQUEST_FAILED))
          _res.end(resp)
        } catch(e) {
          console.error(e)
        }
      })
      break
  }
}

const createServer = () => 
  Promise.resolve(
    http.createServer((_req, _res) => 
      _req.method === 'POST'
        ? post(_req, _res)
        : get(_req, _res)
    )
  )

module.exports = {
  createServer,
  MOCK_SERVER_REQUEST_FAILED
}