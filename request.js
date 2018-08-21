// const handlers = [getHandler, postHandler]

class Request {
  constructor (body) {
    this.method = ''
    this.url = ''
    this.version = ''
    this.headers = {}
    this.body = ''
    // this.handlers = [...handlers]
  }
}

module.exports = Request
