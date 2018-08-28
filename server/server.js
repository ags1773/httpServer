const net = require('net')
const Request = require('./request')
const Response = require('./response')
const {parseReqHeaders, parseReqBody} = require('./httpRequestParser')
const timeout = 2000 // timer after which server closes the socket
let gotHeaders = false // boolean representing if request line and all headers have been recieved

const handlers = []
const routes = {
  GET: {},
  POST: {}
}

function createServer (port) {
  const server = net.createServer()
  server.on('connection', (socket) => {
    console.log('[server] Client connected' + socket.remoteAddress + ':' + socket.remotePort)
    let bodyBuf = Buffer.from([])
    let headerBuf = Buffer.from([])
    let request = new Request(handlers)
    let headersParsed = false
    socket.on('data', chunk => {
      if (gotHeaders) bodyBuf = Buffer.concat([bodyBuf, chunk], bodyBuf.length + chunk.length)
      else {
        let [headerChunk, bodychunk] = getHeaderAndBodyChunks(chunk)
        headerBuf = Buffer.concat([headerBuf, headerChunk], headerBuf.length + headerChunk.length)
        if (bodychunk) {
          bodyBuf = Buffer.concat([bodyBuf, bodychunk], bodyBuf.length + bodychunk.length)
        }
      }
      if (!headersParsed) {
        headersParsed = true
        let str = normalizeHeaders(headerBuf.toString())
        parseReqHeaders(request, str)
        request.socket = socket
      }
      if (headersParsed &&
        (
          Number(request.headers['Content-Length']) === bodyBuf.length ||
          request.headers['Content-Length'] === undefined
        )
      ) {
        console.log(`Processing Request... 'Content-Length': ${request.headers['Content-Length']}, Buffer length: ${bodyBuf.length}`)
        const response = new Response(request)
        if (request.method === 'GET' || request.method === 'POST') {
          console.log('GET or POST request recieved')
          if (request.method === 'POST') request.body = parseReqBody(request.headers, bodyBuf.toString())
          addHandler(methodHandler)
          next(request, response)
        } else {
          response.setStatus(405)
          response.send()
        }
      } else console.log(`REJEKTED! 'Content-Length': ${request.headers['Content-Length']}, Buffer length: ${bodyBuf.length}`)
    })

    socket.setTimeout(timeout) // will trigger 'timeout' event after 'timeout' milliseconds of idling
    socket.on('timeout', () => {
      console.log('[server] Connection timed out')
      socket.end()
    })
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
  let header
  let body
  if (chunk.includes('\r\n\r\n')) {
    gotHeaders = true
    header = chunk.slice(0, chunk.indexOf('\r\n\r\n'))
    body = chunk.slice(chunk.indexOf('\r\n\r\n') + 4)
  } else {
    header = chunk // if headers themselves are recieved over multiple chunks
  }
  return [header, body]
}
function normalizeHeaders (body) {
  return body
    .replace(/content-length/g, 'Content-Length')
    .replace(/content-type/g, 'Content-Type')
}
function next (req, res) {
  const handler = req.handlers.shift()
  if (handler) handler(req, res)
}
function addRoute (method, url, callback) {
  routes[method][url] = callback
}
function addHandler (h) {
  handlers.push(h)
}
function methodHandler (req, res) {
  if (routes[req.method].hasOwnProperty(req.url)) {
    routes[req.method][req.url](req, res)
  } else {
    console.log(`[server] ${req.method} on "${req.url}" route isn't defined`)
    res.setStatus(404)
    res.send()
  }
}

module.exports = {
  createServer,
  addRoute
}
