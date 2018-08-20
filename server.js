const net = require('net')
const timeout = 10 // timer after which server closes the socket
let timeoutId

function start (port) {
  const server = net.createServer()
  server.on('connection', (socket) => {
    let gotData = false
    let body = ''
    console.log('Client connected' + socket.remoteAddress + ':' + socket.remotePort)

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
      console.log('FIN packet recieved')
      console.log('Body => ', body.toString('utf-8'))
    })
    socket.on('close', () => console.log('Socket connection closed by client'))
    socket.on('error', (err) => console.error(err))
  })

  server.listen(port)
  server.on('error', (err) => console.error(err))
  server.on('listening', () => console.log(`Listening on port ${port}`))
}

function timeoutSet (callback) {
  timeoutId = setTimeout(callback, timeout)
}

function timeoutreset (callback) {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(callback, timeout)
}

module.exports = {
  start
}
