function sendData (data, action, method, callback) { // make XHR using JSON
  let XHR = new XMLHttpRequest()

  XHR.open(method, action, true)
  XHR.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  XHR.send(JSON.stringify(data))

  XHR.addEventListener('load', function (e) {
    callback(null, e.target.status)
  })

  XHR.addEventListener('error', function () {
    let err = new Error('Error sending data to server')
    callback(err)
  })
}
