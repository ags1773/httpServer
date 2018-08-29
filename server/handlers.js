const server = require('./server')
const path = require('path')
const fs = require('fs')

function staticFileHandler (req, res, next, dir) {
  console.log('%%% Running Static File handler %%%')
  fs.readdir(dir, (err, files) => {
    console.log('Serving Files => ', files)
    if (err) res.setStatus(404).write(err.message).send()
    else {
      files.forEach(file => {
        server.addRoute('GET', `/${file}`, (request, response) => {
          response.body = fs.readFileSync(path.join(dir, file))
          response.setContentType(path.extname(file).slice(1))
          response.send()
        })
      })
      next(req, res)
    }
  })
}

module.exports = {
  staticFileHandler
}
