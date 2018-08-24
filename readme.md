require 'server':
const server = require('server')

---------Server-----------
Start server:
server.start(port)

Listening for requests on a route:
server.addRoute(method, path, callback)
  method: GET
  callback: 'request' and 'response' objects are available as params to callback function
  example: server.addRoute('GET', '/', (request, response) => {
    response.render('index.html')
  })

---------RESPONSE methods------------
=> render('abc.html'):
  renders file "views/abc.html"
  './views' is the default directory. All your html files should be here for res.render to work

=> json(data):
  converts 'data' to JSON and puts it in res.body
  NOTE: res.send() is needed to write the data to the socket
  example:
  res.json("lorem ipsum")
  res.send()

=> setStatus(statusCode):
  sets res.statusCode and the appropriate res.statusMessage to the response object
