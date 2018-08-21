// input: empty request object, request string
// output => populated request object

const querystring = require('querystring') // parses url encoded data
let headers = {}

function parseHttpRequest (reqObj, str) {
  clearObj(headers)
  let [header, body] = str.split('\r\n\r\n')
  header = header.split('\r\n')
  const startLine = header[0].split(' ')
  header.shift()
  header.forEach(h => {
    const temp = h.split(': ')
    headers[temp[0]] = temp[1]
  })
  body = parseBody(body)

  reqObj.method = startLine[0]
  reqObj.url = startLine[1]
  reqObj.version = startLine[2]
  reqObj.headers = headers
  reqObj.body = body

  return reqObj
}

function parseBody (body) {
  if ('Content-Type' in headers) {
    if (headers['Content-Type'] === 'application/json') {
      console.log('JSON recieved')
      return JSON.parse(body)
    } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      console.log('URL encoded form data recieved')
      return querystring.parse(body)
    } else {
      console.log('Content-Type =>', headers['Content-Type'])
      return body
    }
  } else {
    console.log(`"Content-Type" header not present`)
    return body
  }
}

function clearObj (obj) {
  for (let prop of Object.keys(obj)) {
    delete obj[prop]
  }
}

module.exports = parseHttpRequest
