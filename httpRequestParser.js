const querystring = require('querystring') // parses url encoded data
let headers = {}

function parseHttpRequest (request) {
  clearObj(headers)
  let [header, body] = request.split('\r\n\r\n')
  header = header.split('\r\n')
  const startLine = header[0].split(' ')
  header.shift()
  header.forEach(h => {
    const temp = h.split(': ')
    headers[temp[0]] = temp[1]
  })
  if (startLine[0] === 'POST') {
    changeHeaderName('Content-Length', 'content-length')
    if ('content-length' in headers) {
      if (Number(headers['content-length']) === body.length) {
        body = parseBody(body)
      } else {
        return { parsingError: 'Incomplete body OR Unsupported MIME type' }
      }
    } else {
      return { parsingError: "'content-length' header is not present in POST request" }
    }
  }
  const reqObj = {
    parsingError: false,
    httpVerb: startLine[0],
    path: startLine[1],
    httpVersion: startLine[2],
    headers: headers,
    body: body
  }
  return reqObj
}

function changeHeaderName (incorrect, correct) {
  if (incorrect in headers) {
    headers[correct] = headers[incorrect]
    delete headers[incorrect]
  }
}

function parseBody (body) {
  changeHeaderName('Content-Type', 'content-type')
  if ('content-type' in headers) {
    if (headers['content-type'].includes('json')) {
      console.log('JSON recieved')
      return JSON.parse(body)
    }
    if (headers['content-type'].includes('x-www-form-urlencoded')) {
      console.log('URL encoded form data recieved')
      return querystring.parse(body)
    }
  }
}

function clearObj (obj) {
  for (let prop of Object.keys(obj)) {
    delete obj[prop]
  }
}

module.exports = parseHttpRequest
