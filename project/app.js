const server = require('../server/server')

server.start(3000)
server.addRoute('GET', '/', (req, res) => {
  res.render('home.html')
})
server.addRoute('GET', '/test', (req, res) => {
  res.render('test.html')
})
server.addRoute('GET', '/json', (req, res) => {
  res.setStatus(418)
  res.json(`{
    '6562d007a0e': '&b Added Express.contentsOf()',
    'b8da6d451ff': ['&b Added', 'spec for', 'Express.contentsOf()'],
    'd561c550ff5': {
      '7489deecddf': '&b Added Express.header()'
    }
  }`)
  res.send()
})
