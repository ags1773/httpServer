const server = require('../server/server')
const {staticFileHandler} = require('../server/handlers')
const path = require('path')

server.addHandler((req, res, next) => {
  staticFileHandler(req, res, next, path.join(__dirname, 'public'))
})

server.addHandler((req, res, next) => {
  console.log('>>>> TEST HANDLER 123 <<<<')
  next(req, res)
})

server.createServer(3000)
server.addRoute('GET', '/', (req, res) => {
  res.render('home.html')
})
server.addRoute('GET', '/test', (req, res) => {
  res.render('test.html')
  // res.render('/jjjj')
})
server.addRoute('GET', '/json', (req, res) => {
  res.setStatus(418).json([1, 2, 3, 4, 5]).send()
  // res.json([1, 2, 3, 4, 5]).send()
  // res.json()
})
server.addRoute('POST', '/post', (req, res) => {
  console.log('body >>>', req.body)
  console.log(`STATUS >> ${res.statusCode}`)
  res.setStatus(200).send()
})
server.addRoute('GET', '/12', (req, res) => {
  res.setContentType('jpg')
  res.setStatus(305)
  res.json({
    message: 'Hello',
    status: 'Wait',
    code: 235
  }).send()
})
server.addRoute('GET', '/write', (req, res) => {
  res.write('Bacon ipsum dolor amet ')
})
server.addRoute('GET', '/write/html', (req, res) => {
  res.write('<h2>FUA</h2>').setContentType('html')
})

server.addRoute('GET', '/:id', (req, res) => {
  res.write('test')
})
