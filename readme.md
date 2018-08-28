# Creating & running server
require 'server'
```sh
const server = require('server')
server.createServer(port)
```

## SERVER
### Listening for requests on a route:
```sh
server.addRoute(method, path, callback)
```
method: GET / POST
path: The URL path
callback: Function executed after client hits the route
- #### Example
    ```sh
    server.addRoute('GET', '/', (request, response) => {
        response.render('index.html')
    })
    ```
    ```sh
    server.addRoute('POST', '/post', (req, res) => {
        console.log('body >>>', req.body)
        res.setStatus(200)
        res.send()
    })
    ```

## RESPONSE Methods
- ### response.render('index.html')
    - renders file "views/index.html"
    - './views' is the default directory. All your html files should be here for         res.render to work
- ### response.json(data)
    - converts 'data' to JSON and puts it in res.body
    - NOTE: res.send() is needed to write the data to the socket
    - #### Example
    ```sh
        res.json("lorem ipsum")
        res.send()
    ```
- ### response.setStatus(statusCode)
    - sets res.statusCode and the appropriate res.statusMessage to the response object
