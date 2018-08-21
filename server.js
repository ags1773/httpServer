const net = require('net')
// const Request = require('./request')
const timeout = 1000 // timer after which server closes the socket
let timeoutId
let contentLength

function start (port) {
  const server = net.createServer()
  server.on('connection', (socket) => {
    let gotData = false // boolean representing if first chunk is recieved
    let body = ''
    console.log('[server] Client connected' + socket.remoteAddress + ':' + socket.remotePort)

    socket.on('data', (chunk) => {
      body += chunk
      if (!gotData) {
        gotData = true
        body = normalizeHeaders(body)
        const httpMethod = body.slice(0, body.indexOf(' '))
        if (!httpMethod) closeSocketWithError(socket, 400)
        if (httpMethod === 'GET') {
          writeOkResponse(socket)
          console.log('GET request recieved')
          console.log(body)
          createReqRes(body, socket)
          socket.end()
        } else if (httpMethod === 'POST') {
          console.log('POST request recieved')
          if (body.includes('Content-Length')) {
            contentLength = Number(parseContentLengthHeader(body))
            const bodyLength = getBodyLength(body)
            if (contentLength !== bodyLength) {
              // wait for some time to recieve more data
              // end socket with error on timeout
              console.log('contentLength, bodyLength', contentLength, bodyLength)
              console.log('mismatch! waiting for more chunks...')
              timeoutSet(() => closeSocketWithError(socket, 400))
            } else {
              createReqRes(body, socket)
              socket.end()
            }
          } else closeSocketWithError(socket, 411)
        } else closeSocketWithError(socket, 405, `"${httpMethod}" is an unsupported method`)
      } else {
        console.log('Chunk recieved')
        timeoutreset(() => {
          const bodyLength = getBodyLength(body)
          console.log('contentLength, bodyLength', contentLength, bodyLength)
          if (contentLength === bodyLength) {
            createReqRes(body, socket)
            socket.end()
          } else closeSocketWithError(socket, 400)
        })
      }
    })

    socket.on('end', () => {
      console.log('[server] FIN packet recieved')
      body = ''
    })
    socket.on('close', () => console.log('[server] Socket connection closed by client'))
    socket.on('error', (err) => console.error(err))
  })

  server.listen(port)
  server.on('error', (err) => console.error(err))
  server.on('listening', () => console.log(`[server] Listening on port ${port}`))
}

function timeoutSet (callback) {
  timeoutId = setTimeout(callback, timeout)
}
function timeoutreset (callback) {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(callback, timeout)
}
function createReqRes (body, socket) {
  // generate req obj (add handlers)
  // parse body, populate request obj
  // generate response from request
  // call handler functions one by one using next()

  console.log('create request response objects & proceed')
  // const request = new Request(body)
  // console.log(request)
}
function closeSocketWithError (socket, statusCode, errorMsg = '') {
  const HTTPstatus = {
    400: 'Bad Request',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    411: 'Length Required',
    418: `I'm a teapot`
  }

  console.error(`[server] ${statusCode} - ${HTTPstatus[statusCode]} - ${errorMsg}`)
  socket.write(`HTTP/1.1 ${statusCode} ${HTTPstatus[statusCode]}\r\n`)
  socket.write('Date: ' + (new Date()).toString() + '\r\n')
  socket.write('Connection: close\r\n')
  socket.write('Content-Type: text/plain\r\n')
  socket.write('\r\n')
  if (errorMsg) {
    socket.write(errorMsg + '\r\n')
  }
  socket.end()
}
function writeOkResponse (socket) {
  socket.write('HTTP/1.1 200 OK\r\n')
  socket.write('Date: ' + (new Date()).toString() + '\r\n')
  socket.write('Connection: close\r\n')
  socket.write('Content-Type: text/plain\r\n')
  socket.write('\r\n')
}
function parseContentLengthHeader (body) {
  let temp = body.slice(body.indexOf('Content-Length'))
  return temp.slice(0, temp.indexOf('\r\n')).split(' ')[1]
}
function getBodyLength (body) {
  const i = body.indexOf('\r\n\r\n')
  return body.slice(i + 4).length
}
function normalizeHeaders (body) {
  let temp
  temp = body.replace(/content-type/g, 'Content-Type')
  temp = body.replace(/content-length/g, 'Content-Length')
  return temp
}

module.exports = {
  start
}