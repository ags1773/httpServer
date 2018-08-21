const net = require('net')
const Request = require('./request')
const timeout = 10 // timer after which server closes the socket
let timeoutId

function start (port) {
  const server = net.createServer()
  server.on('connection', (socket) => {
    let gotData = false
    let body = ''
    console.log('[server] Client connected' + socket.remoteAddress + ':' + socket.remotePort)

    socket.on('data', (chunk) => {
      body += chunk
      if (!gotData) { // write response, close socket after timeout
        gotData = true
        socket.write('HTTP/1.1 200 OK\r\n')
        socket.write('Date: ' + (new Date()).toString() + '\r\n')
        socket.write('Connection: close\r\n')
        socket.write('Content-Type: text/plain\r\n')
        socket.write('\r\n')
        timeoutSet(() => socket.end('Closing socket connection from server side...\r\n'))
      } else {
        timeoutreset(() => socket.end('Closing socket connection from server side...\r\n'))
      }
    })

    socket.on('end', () => {
      console.log('[server] FIN packet recieved')
      console.log('Body => ', body.toString())
      const httpMethod = body.slice(0, body.indexOf(' '))
      if (!httpMethod || httpMethod !== 'GET') console.log('Bad http method')
      else { // at this stage, allow only GET requests
        createReqRes(body.toString(), socket)
      }
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

  const request = new Request(body)
  console.log(request)
}

module.exports = {
  start
}
