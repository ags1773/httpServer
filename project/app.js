const server = require('../server/server')

server.createServer(3000)
server.addRoute('GET', '/', (req, res) => {
  res.render('home.html')
})
server.addRoute('GET', '/test', (req, res) => {
  res.render('test.html')
  // res.render('/jjjj')
})
server.addRoute('GET', '/json', (req, res) => {
  res.setStatus(418)
  res.json([1, 2, 3, 4, 5])
  // res.json()
  res.send()
})
server.addRoute('GET', '/12', (req, res) => {
  res.setContentType('jpg')
  res.setStatus(305)
  res.json({
    message: 'Hello',
    status: 'Wait',
    code: 235
  })
  res.send()
})
server.addRoute('GET', '/write', (req, res) => {
  res.write('Bacon ipsum dolor amet ').send()
})
server.addRoute('GET', '/write/html', (req, res) => {
  res.write('<h2>FUA</h2>')
  res.setContentType('html')
  res.send()
})
