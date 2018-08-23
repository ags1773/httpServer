const server = require('../server/server')

server.start(3000)
server.addRoute('GET', '/', (req, res) => {
  res.render('home.html') // render static/home.html; Content-Type: text/html
})
server.addRoute('GET', '/test', (req, res) => {
  res.render('test.html')
})

// res.send('useless test') => Buffer/string/object/array
// res.json({JSON})
// res.render(index.html) => this is only for html files
// res.status(404)
