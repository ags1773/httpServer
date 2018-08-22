// see what resource the request is asking. Get that resource, put it in response and write it to socket
// must return a function
// start by just serving 'index.html' no matter what the request

const fs = require('fs')

function getHandler (req, res, next) {
  fs.readFile('./staticFiles/index.html', (err, data) => {
    if (err) console.error(err)
    req.socket.write(data)
    req.socket.write('\r\n')
    req.socket.end()
  })
}

module.exports = getHandler
