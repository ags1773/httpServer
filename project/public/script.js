// function sendData (data, action, method, callback) { // make XHR using JSON
//   let XHR = new XMLHttpRequest()

//   XHR.open(method, action, true)
//   XHR.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
//   XHR.send(JSON.stringify(data))

//   XHR.addEventListener('load', function (e) {
//     callback(null, e.target.status)
//   })

//   XHR.addEventListener('error', function () {
//     let err = new Error('Error sending data to server')
//     callback(err)
//   })
// }

// document.querySelector('button[type="submit"]').addEventListener('click', (e) => {
//   e.preventDefault()
//   let data = {todo: document.querySelector('input').value}
//   if (data) {
//     sendData(data, '/', 'POST', (err, status) => {
//       if (err) console.log(err)
//       else {
//         document.querySelector('input').value = ''
//         console.log('Data sent via XHR')
//       }
//     })
//   }
// })
