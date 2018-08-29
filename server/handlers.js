const server = require('./server')
const path = require('path')
const fs = require('fs')

function staticFileHandler (req, res, next, dir) {
  console.log('%%% Running Static File handler %%%')
  try {
    fs.readdirSync(dir).forEach(file => {
      server.addRoute('GET', `/${file}`, (request, response) => {
        response.body = fs.readFileSync(path.join(dir, file))
        response.setContentType(path.extname(file).slice(1))
        response.send()
      })
    })
    next(req, res)
  } catch (err) {
    res.setStatus(404).write(err.message).send()
  }
}

module.exports = {
  staticFileHandler
}
