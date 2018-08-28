const querystring = require('querystring') // parses url encoded data

function parseReqHeaders (reqObj, headerStr) {
  const headers = {}
  headerStr = headerStr.split('\r\n')
  const startLine = headerStr[0].split(' ')
  headerStr.shift()
  headerStr.forEach(h => {
    const temp = h.split(': ')
    headers[temp[0]] = temp[1]
  })
  reqObj.method = startLine[0]
  reqObj.url = startLine[1]
  reqObj.version = startLine[2]
  reqObj.headers = headers
}

function parseReqBody (headers, body) {
  try {
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
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  parseReqHeaders,
  parseReqBody
}
