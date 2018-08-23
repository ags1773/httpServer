const path = require('path')
const fs = require('fs')
const defaultDir = './public'

const httpStatusCodes = {
  200: 'OK',
  400: 'Bad Request',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  411: 'Length Required',
  418: `I'm a teapot`,
  500: 'Internal Server Error'
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
}

class Response {
  constructor (request) {
    this.version = 'HTTP/1.1'
    this.statusCode = 200
    this.statusMessage = httpStatusCodes[this.statusCode]
    this.socket = request.socket
    this.headers = {
      Date: (new Date()).toString(),
      Connection: request.headers['Connection'] || 'keep-alive'
    }
    this.body = ''
  }

  setStatus (code) {
    this.statusCode = code
    this.statusMessage = httpStatusCodes[code]
  }
  setContentType (url) {
    let ext = path.extname(url)
    this.headers['Content-Type'] = mimeTypes[ext]
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
        this.headers['Content-Type'] = 'text/html'
      }
      this.writeToSocketAndEnd()
    })
  }
  writeToSocketAndEnd () {
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
      this.socket.end() // ends socket if no body or if error
    })
  }
}

module.exports = Response
