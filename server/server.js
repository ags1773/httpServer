const net = require('net')
const Request = require('./request')
const Response = require('./response')
const requestParser = require('./httpRequestParser')
const timeout = 10 // timer after which server closes the socket
let timeoutId
let contentLength

const handlers = []
const routes = {
  GET: {},
  POST: {}
}

function start (port) {
  const server = net.createServer()
  server.on('connection', (socket) => {
    let gotData = false // boolean representing if first chunk is recieved
    let body = ''
    console.log('[server] Client connected' + socket.remoteAddress + ':' + socket.remotePort)

    socket.on('data', (chunk) => {
      // console.log('chunk =>', chunk)
      body += chunk
      if (!gotData) {
        gotData = true
        body = normalizeHeaders(body)
        const httpMethod = body.slice(0, body.indexOf(' '))
        if (!httpMethod) closeSocketWithError(socket, 400)
        if (httpMethod === 'GET') {
          writeOkResponse(socket)
          console.log(body)
          addHandler(getHandler)
          createReqRes(body, socket)
          // socket.end()
        } else if (httpMethod === 'POST') {
          console.log('POST request recieved')
          closeSocketWithError(socket, 405) // Don't allow POST requests for now
          // if (body.includes('Content-Length')) {
          //   contentLength = Number(parseContentLengthHeader(body))
          //   const bodyLength = getBodyLength(body)
          //   if (contentLength !== bodyLength) {
          //     // wait for some time to recieve more data
          //     // end socket with error on timeout
          //     console.log('contentLength, bodyLength', contentLength, bodyLength)
          //     console.log('mismatch! waiting for more chunks...')
          //     timeoutSet(() => closeSocketWithError(socket, 400))
          //   } else {
          //     createReqRes(body, socket)
          //     socket.end()
          //   }
          // } else closeSocketWithError(socket, 411)
        } else closeSocketWithError(socket, 405, `"${httpMethod}" is an unsupported method`)
      } else {
        console.log('Chunk recieved')
        // timeoutreset(() => {
        //   const bodyLength = getBodyLength(body)
        //   console.log('contentLength, bodyLength', contentLength, bodyLength)
        //   if (contentLength === bodyLength) {
        //     createReqRes(body, socket)
        //     socket.end()
        //   } else closeSocketWithError(socket, 400)
        // })
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
  // socket.write('Content-Type: text/plain\r\n')
  socket.write('Content-Type: text/html\r\n')
  socket.write('\r\n')
}
function parseContentLengthHeader (body) {
  let temp = body.slice(body.indexOf('Content-Length'))
  return temp.slice(0, temp.indexOf('\r\n')).split(' ')[1]
}
function getBodyLength (body) {
  const i = body.indexOf('\r\n\r\n')
  return Buffer.byteLength(body.slice(i + 4))
}
function normalizeHeaders (body) {
  return body
    .replace(/content-length/g, 'Content-Length')
    .replace(/content-type/g, 'Content-Type')
}

function createReqRes (body, socket) {
  let request = new Request(handlers)
  request = requestParser(request, body)
  request.socket = socket
  const response = new Response(request)
  next(request, response)
}
function next (req, res) {
  const handler = req.handlers.shift()
  handler(req, res, next)
}
function addRoute (method, url, callback) {
  routes[method][url] = callback
}
function addHandler (h) {
  handlers.push(h)
}
function getHandler (req, res, next) {
  // routes obj contains ['route': 'function'] key value pairs made at time of creating the server
  // getHandler sees what url the user (i.e. client wrt the server) has requested
  // if it exists in routes obj, execute the function associated with that route
  if (routes.GET.hasOwnProperty(req.url)) {
    console.log(`running getHandler for ${req.url}`)
    routes['GET'][req.url](req, res)
  } else {
    console.log(`${req.url} route isn't defined`)
    res.setStatus(404)
    res.send()
  }
}

module.exports = {
  start,
  addRoute
}
