const R = require('ramda')
const EventEmitter = require('events')
const http = require('node:http')
const errors = require('../errors')
const multibase = require('multibase')

class PubSub {
  constructor(ipfsProvider) {
    this.provider = ipfsProvider
  }

  writeBinaryPostData(req, data) {
    // This is the only way found by the author
    // to send multipart/form-data to the IPFS
    // node (node-fetch was not working)
    const crlf = '\r\n'
    const boundaryKey = Math.random().toString(16)
    const boundary = `--${boundaryKey}`
    const delimeter = `${crlf}--${boundary}`
    const closeDelimeter = `${delimeter}--`
    const headers = ['Content-Disposition: form-data; name="file";' + crlf]

    const multipartBody = Buffer.concat([
      Buffer.from(delimeter + crlf + headers.join('') + crlf),
      Buffer.from(data),
      Buffer.from(closeDelimeter),
    ])

    req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)
    req.setHeader('Content-Length', multipartBody.length)
    req.write(multipartBody)
    req.end()
  }

  httpMultipartFormData(_url, _opts, _content) {
    return new Promise((resolve, reject) => {
      const request = http.request(_url, _opts, _resp => {
        const data = ''
        _resp.setEncoding('utf-8')
        _resp.on('data', R.concat(data))
        _resp.on('end', () => resolve(data))
      })

      request.on('error', reject)
      this.writeBinaryPostData(request, _content)
      request.end()
    })
  }

  base64UrlEncode(_topic) {
    const encodedTopic = multibase.encode('base64url', Buffer.from(_topic))
    return Buffer.from(encodedTopic).toString('utf-8')
  }

  /**
   * Usage:
   *
   * const { ipfs } = require('ptokens-utils')
   * ...
   * try {
   *   const provider = new ipfs.IPFSProvider(url)
   *   const pubSub = new ipfs.PubSub(provider)
   *
   *   await pubSub.pub('topic', 'content')
   * } catch(e) {
   *   console.error(e)
   * }
   *
   **/
  pub(_topic, _content) {
    return this.provider.checkDaemon().then(_ => {
      const encodedTopic = this.base64UrlEncode(_topic)
      const url = `${this.provider.url}/api/v0/pubsub/pub?arg=${encodedTopic}`
      const method = 'POST'
      const headers = {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(_content),
      }
      return this.httpMultipartFormData(url, { method, headers }, _content)
    })
  }

  base64UrlDecode(_data) {
    return Buffer.from(multibase.decode(_data)).toString('utf-8')
  }

  // Custom curry
  maybeEmitDataProperty(_eventEmitter) {
    return _data => {
      const json = JSON.parse(_data)
      try {
        return R.isNotNil(json) && R.has('data', json)
          ? _eventEmitter.emit('message', this.base64UrlDecode(json['data']))
          : _eventEmitter.emit(
              'error',
              new Error(`${errors.ERROR_IPFS_PUBSUB_DATA_PARSING}: ${_data}`)
            )
      } catch (_err) {
        _eventEmitter.emit(
          'error',
          new Error(`${errors.ERROR_IPFS_PUBSUB_DATA_PARSING}: ${_err} - ${_data}`)
        )
      }
    }
  }

  /**
   * Usage:
   *
   * const { ipfs } = require('ptokens-utils')
   * ...
   * const provider = new ipfs.IPFSProvider(url)
   * const pubSub = new ipfs.PubSub(provider)
   * const subscriber = await pubSub.sub('topic')
   * subscriber.on('message', (message) => { console.log(`[${topic}]:`, message) })
   * subscriber.on('error', errorHandler)
   * subscriber.on('close', closeHandler) // Fired when the IFPS daemon is shutted down
   * ...
   **/
  sub(_topic) {
    const encodedTopic = this.base64UrlEncode(_topic)
    const url = `${this.provider.url}/api/v0/pubsub/sub?arg=${encodedTopic}`
    const method = 'POST'
    const headers = { 'Content-Type': 'text/plain' }
    const eventEmitter = new EventEmitter()
    const request = http.request(url, { method, headers }, _resp => {
      // We expect something like
      // {
      //   "from": "12D3...",
      //   "data": "ueyJ...",
      //   "seqno": "uF5l...",
      //   "topicIDs": [ "ucG5..." ]
      // }
      _resp.setEncoding('utf-8')
      _resp.on('data', this.maybeEmitDataProperty(eventEmitter))
      _resp.on('end', () => eventEmitter.emit('close'))
    })

    request.on('error', _err => eventEmitter.emit('error', _err))
    request.end()

    return Promise.resolve(eventEmitter)
  }
}

module.exports = PubSub
