class Request {
  constructor (handlers) {
    this.method = ''
    this.url = ''
    this.version = ''
    this.headers = {}
    this.body = ''
    this.handlers = [...handlers]
  }
}

module.exports = Request
