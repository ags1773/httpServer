const net = require('net')
const port = 3000
const timeout = 2000 // timer after which server closes the socket
let timeoutId
const server = net.createServer()
const fs = require('fs')

server.on('connection', (socket) => {
  let gotData = false
  console.log('Client connected' + socket.remoteAddress + ':' + socket.remotePort)

  socket.on('data', (chunk) => {
    // console.log(`Data recieved`, chunk.toString('utf-8'))
    if (!gotData) { // write response, close socket after timeout
      gotData = true
      fs.appendFile('dump.txt', chunk, (err) => console.log(err))
      socket.write('HTTP/1.1 200 OK\r\n')
      socket.write('Date: ' + (new Date()).toString() + '\r\n')
      socket.write('Connection: close\r\n')
      socket.write('Content-Type: text/plain\r\n')
      socket.write('\r\n')
      // socket.write(chunk.toString())
      // socket.write('\r\n')
      socket.write('First chunk recieved\r\n')
      console.log('First chunk recieved')
      timeoutSet(() => socket.end('Closing socket connection...\r\n'))
    } else { // if there are more incomming chunks, write them to response and reset the timeout
      // socket.write(chunk.toString())
      // socket.write('\r\n')
      fs.appendFile('dump.txt', chunk, (err) => console.log(err))
      console.log('Chunk recieved')
      socket.write('Chunk recieved\r\n')
      timeoutreset(() => socket.end('Closing socket connection...\r\n'))
    }
  })

  socket.on('end', () => console.log('FIN packet recieved'))
  socket.on('close', () => console.log('Socket connection closed by client'))
  socket.on('error', (e) => console.error(e))
})

server.listen(port, () => console.log('Server started on port ' + port))

function timeoutSet (callback) {
  console.log('Timeout SET')
  timeoutId = setTimeout(callback, timeout)
}

function timeoutreset (callback) {
  console.log('Timeout RESET')
  clearTimeout(timeoutId)
  timeoutId = setTimeout(callback, timeout)
}
