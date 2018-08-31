const server = require('../server/server')
const {staticFileHandler} = require('../server/handlers')
const path = require('path')
const fs = require('fs')
const Item = require('./todoItem')

server.addHandler((req, res, next) => {
  staticFileHandler(req, res, next, path.join(__dirname, 'public'))
})
server.createServer(3000)

server.addRoute('GET', '/', (req, res) => res.render('home.html'))
server.addRoute('GET', '/game', (req, res) => res.render('rgbGame.html'))
server.addRoute('GET', '/todo', (req, res) => {
  fs.readFile(path.join(__dirname, '/todos.txt'), (err, data) => {
    if (err) res.setStatus(404).write(err.message).send()
    else {
      let dataArr = data.length ? JSON.parse(data) : []
      let LIs = ''
      if (dataArr.length) {
        dataArr.forEach(e => {
          LIs += `<li id="${e.id}">
            <button class="btnDel">X</button>
            ${e.value}
          </li>`
        })
      } else LIs = '---Nothing to show---'
      let content = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>To Do List</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body id="todo">
          <a href="/">Go Home</a>
          <div id="todoWrapper">
            <form action="/todo" method="post">
              <input type="text" name="todo" placeholder="To-Do" />
              <button type="submit">Add Todo</button>
            </form>
            <hr>
            <div>
              My To-Dos:
              <ul>` + LIs + `</ul>
            </div>
          </div>
          <script src="/xhr.js"></script>
          <script src="/script.js"></script>
        </body>
      </html>`
      res.write(content).setStatus(200).setContentType('html').send()
    }
  })
})
server.addRoute('POST', '/todo', (req, res) => {
  const todo = req.body.todo
  const fileSize = fs.statSync(path.join(__dirname, 'todos.txt')).size
  let buf = Buffer.alloc(fileSize)
  fs.open(path.join(__dirname, 'todos.txt'), 'r+', (err, fd) => {
    if (err) res.setStatus(500).write(err.message).send()
    else {
      let len = fs.readSync(fd, buf, 0, fileSize, 0)
      let todos = len === 0 ? [] : JSON.parse(buf.toString())
      todos.push(new Item(todo))
      todos = JSON.stringify(todos)
      let writeBuf = Buffer.from(todos)
      fs.writeSync(fd, writeBuf)
      fs.closeSync(fd)
      res.redirect('/todo')
    }
  })
})
server.addRoute('POST', '/todo/delete', (req, res) => {
  console.log('Hit POST /todo/delete')
  const id = req.body
  const fileSize = fs.statSync(path.join(__dirname, 'todos.txt')).size
  let buf = Buffer.alloc(fileSize)
  fs.open(path.join(__dirname, 'todos.txt'), 'r+', (err, fd) => {
    if (err) res.setStatus(500).write(err.message).send()
    else {
      fs.readSync(fd, buf, 0, fileSize, 0)
      let todos = JSON.parse(buf.toString())
      for (const [i, todo] of todos.entries()) { // todos.entries() returns a new Array Iterator object that contains the key/value pairs for each index in the array
        if (todo.id === Number(id)) {
          todos.splice(i, 1)
          break
        }
      }
      todos = JSON.stringify(todos)
      let writeBuf = Buffer.from(todos)
      fs.truncateSync(fd)
      fs.writeSync(fd, writeBuf)
      fs.closeSync(fd)
      res.redirect('/todo')
    }
  })
})
