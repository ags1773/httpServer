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
      // if (headers['Content-Type'] === 'application/json') {
      if (headers['Content-Type'].includes('application/json')) {
        console.log('JSON recieved')
        return [JSON.parse(body), false]
      // } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      } else if (headers['Content-Type'].includes('application/x-www-form-urlencoded')) {
        console.log('URL encoded form data recieved')
        return [querystring.parse(body), false]
      } else console.log('Content-Type =>', headers['Content-Type'])
    } else console.log(`"Content-Type" header not present`)
    return [body, false]
  } catch (err) {
    console.log(err)
    return [null, err]
  }
}

module.exports = {
  parseReqHeaders,
  parseReqBody
}
