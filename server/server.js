const net = require('net')
const Request = require('./request')
const Response = require('./response')
const {parseReqHeaders, parseReqBody} = require('./httpRequestParser')
const timeout = 5000 // timer after which server closes the socket

const handlers = []
const routes = {
  GET: {},
  POST: {}
}

function createServer (port) {
  const server = net.createServer()
  server.on('connection', (socket) => {
    console.log('[server] Client connected' + socket.remoteAddress + ':' + socket.remotePort)
    let gotHeaders = false // boolean representing if request line and all headers have been recieved
    let bodyBuf = Buffer.from([])
    let headerBuf = Buffer.from([])
    let request = new Request(handlers.concat([methodHandler]))
    // console.log('Request =>', request)
    let headersParsed = false
    socket.on('data', chunk => {
      if (gotHeaders) bodyBuf = Buffer.concat([bodyBuf, chunk], bodyBuf.length + chunk.length)
      else {
        let [headerChunk, bodychunk, flag] = getHeaderAndBodyChunks(chunk)
        gotHeaders = flag
        headerBuf = Buffer.concat([headerBuf, headerChunk], headerBuf.length + headerChunk.length)
        if (bodychunk) {
          bodyBuf = Buffer.concat([bodyBuf, bodychunk], bodyBuf.length + bodychunk.length)
        }
      }
      if (gotHeaders && !headersParsed) {
        headersParsed = true
        let str = normalizeHeaders(headerBuf.toString())
        parseReqHeaders(request, str)
        console.log('Request ==>', request)
        request.socket = socket
      }
      if (headersParsed) {
        const contentLengthHeader = Number(request.headers['Content-Length'])
        if (request.method !== 'GET' && request.method !== 'POST') closeSocketWithError(socket, 405)
        else if (request.method === 'POST' && request.headers['Content-Length'] === 'undefined') closeSocketWithError(socket, 411)
        else if (request.method === 'POST' && contentLengthHeader < bodyBuf.length) closeSocketWithError(socket, 400)
        else if (contentLengthHeader > bodyBuf.length) console.log(`[server] Waiting for more data chunks...`)
        else if (request.method === 'POST' && contentLengthHeader === bodyBuf.length) {
          request.body = parseReqBody(request.headers, bodyBuf.toString())
          doStuff(request)
        } else if (request.method === 'GET') doStuff(request)
        else closeSocketWithError(socket, 500, 'Error! something slipped through the cracks...')
      }
    })

    socket.setTimeout(timeout) // will trigger 'timeout' event after 'timeout' milliseconds of idling
    socket.on('timeout', () => closeSocketWithError(socket, 408))
    socket.on('end', () => {
      console.log('[server] FIN packet recieved')
      headerBuf = Buffer.from([])
      bodyBuf = Buffer.from([])
      gotHeaders = false
    })
    socket.on('close', () => console.log('[server] Socket connection closed by client ------------'))
    socket.on('error', (err) => console.error(err))
  })

  server.listen(port)
  server.on('error', (err) => console.error(err))
  server.on('listening', () => console.log(`[server] Listening on port ${port}`))
}
function getHeaderAndBodyChunks (chunk) {
  let header, body
  let flag = false // replicates gotHeaders
  if (chunk.includes('\r\n\r\n')) {
    flag = true
    header = chunk.slice(0, chunk.indexOf('\r\n\r\n'))
    body = chunk.slice(chunk.indexOf('\r\n\r\n') + 4)
  } else {
    header = chunk // if headers themselves are recieved over multiple chunks
  }
  return [header, body, flag]
}
function normalizeHeaders (body) {
  return body
    .replace(/content-length/g, 'Content-Length')
    .replace(/content-type/g, 'Content-Type')
}
function closeSocketWithError (socket, statusCode, errorMsg = '') {
  const HTTPstatus = {
    400: 'Bad Request',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    411: 'Length Required',
    500: 'Internal Server Error'
  }
  console.error(`[server] ${statusCode} - ${HTTPstatus[statusCode]} ${errorMsg}`)
  socket.write(`HTTP/1.1 ${statusCode} ${HTTPstatus[statusCode]}\r\n`)
  socket.write('Date: ' + (new Date()).toString() + '\r\n')
  socket.write('Connection: close\r\n')
  socket.write('\r\n')
  if (errorMsg) {
    socket.write(errorMsg + '\r\n')
  }
  socket.end()
}
function doStuff (request) {
  console.log('@@@ DO STUFF @@@')
  const response = new Response(request)
  console.log('Handlers >>', request.handlers)
  next(request, response)
}
function next (req, res) {
  const handler = req.handlers.shift()
  if (handler) handler(req, res, next)
  else console.log('No more handlers to run...')
}
function addRoute (method, url, callback) {
  routes[method][url] = callback
}
function addHandler (h) {
  handlers.push(h)
}
function methodHandler (req, res, next) {
  console.log('%%% Running method handler %%%')
  if (routes[req.method].hasOwnProperty(req.url)) {
    routes[req.method][req.url](req, res)
    next(req, res)
  } else {
    console.log(`[server] ${req.method} on "${req.url}" route isn't defined`)
    res.setStatus(404)
    res.send()
  }
}

module.exports = {
  createServer,
  addRoute,
  addHandler
}
