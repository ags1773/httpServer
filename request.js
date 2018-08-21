const getHandler = require('./getHandler')
const handlers = [getHandler]
// const handlers = [getHandler, postHandler]

class Request {
  constructor () {
    this.method = ''
    this.url = ''
    this.version = ''
    this.headers = {}
    this.body = ''
    this.handlers = [...handlers]
  }
}

module.exports = Request
