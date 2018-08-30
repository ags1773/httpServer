const server = require('../server/server')
const {staticFileHandler} = require('../server/handlers')
const path = require('path')
const fs = require('fs')

server.addHandler((req, res, next) => {
  staticFileHandler(req, res, next, path.join(__dirname, 'public'))
})
server.createServer(3000)

server.addRoute('GET', '/', (req, res) => {
  // fetch todos from file, make html, render it
  fs.readFile(path.join(__dirname, '/todos.txt'), (err, data) => {
    if (err) res.setStatus(404).write(err.message).send()
    else {
      let LIs = '<li>No To-Dos to show</li>'
      if (data && data.length) {
        // console.log('DATA >>>>', data.toString().split('\r\n').splice(-1))
        console.log('DATA >>>>', data.toString().split('\r\n').slice(0, -1).map(e => '<li>' + e + '</li>').join(''))
        LIs = data.toString().split('\r\n').slice(0, -1).map(e => '<li>' + e + '</li>').join('')
      }
      let content = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>To Do List</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <form action="/" method="post">
          <input type="text" placeholder="To-Do">
          <button type="submit">Add Todo</button>
        </form>
        <div>
          My To-Dos:
          <ul>` + LIs + `</ul>
          </div>
          <script src="/script.js"></script>
        </body>
        </html>`
      res.write(content).setStatus(200).setContentType('html').send()
    }
  })
})
server.addRoute('POST', '/', (req, res) => {
  // add todo to file
  console.log('POST body >>>>', req.body)
  const todo = req.body.todo + '\r\n'
  fs.appendFile(path.join(__dirname, 'todos.txt'), todo, (err) => {
    if (err) res.setStatus(500).write(err.message).send()
    res.setStatus(200).send()
  })
})
