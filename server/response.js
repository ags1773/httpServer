const path = require('path')
const fs = require('fs')
const defaultDir = './views'
const httpStatusAndMime = require('./httpStatusAndMime')
const httpStatusCodes = httpStatusAndMime.status
const mimeTypes = httpStatusAndMime.mimeTypes

class Response {
  constructor (request) {
    this.version = 'HTTP/1.1'
    this.statusCode = 200
    this.statusMessage = httpStatusCodes[this.statusCode]
    this.socket = request.socket
    this.headers = {
      Date: (new Date()).toString(),
      Connection: 'close'
    }
    this.body = ''
  }

  setStatus (code) {
    this.statusCode = code
    this.statusMessage = httpStatusCodes[code]
    return this
  }
  setContentType (c) {
    this.headers['Content-Type'] = mimeTypes[c]
    return this
  }
  getResponseStr () {
    let str = ''
    str += this.version + ' ' + this.statusCode + ' ' + this.statusMessage + '\r\n'
    for (let header in this.headers) {
      if (this.headers.hasOwnProperty(header)) str += header + ': ' + this.headers[header] + '\r\n'
    }
    str += '\r\n'
    return str
  }
  send () {
    this.headers['Content-Length'] = typeof (this.body) !== 'string'
      ? this.body.byteLength
      : this.body.length
    this.socket.write(this.getResponseStr(), (err) => {
      if (err) console.error(err)
      else {
        if (this.body) {
          this.socket.write(this.body, (err) => {
            if (err) console.error(err)
            else this.socket.end()
          })
        }
      }
      this.socket.end()
    })
  }
  render (htmlFile) {
    fs.readFile(path.join(defaultDir, htmlFile), (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          this.setStatus(404)
        } else {
          this.setStatus(500)
        }
        console.error(err)
      } else {
        const buf = Buffer.from('\r\n')
        this.body = Buffer.concat([data, buf])
        this.setContentType('html')
      }
      this.send()
    })
  }
  json (body) {
    try {
      this.body = JSON.stringify(body)
      this.body += '\r\n'
      this.setContentType('json')
    } catch (err) {
      this.setStatus(500)
      console.error(err)
    }
    return this
  }
  write (str) {
    // similar to res.send() in express
    if (typeof (str) !== 'string') {
      this.setStatus(500)
      console.error(`[server] ${str} needs to be a string`)
    } else {
      this.body += str
      this.body += '\r\n'
      if (this.headers['Content-Type'] === undefined) this.setContentType('text')
    }
    return this
  }
}

module.exports = Response
