const pageId = document.querySelector('body').id

if (pageId === 'todo') {
  const X = document.querySelectorAll('.btnDel')

  X.forEach(btn => {
    btn.addEventListener('click', (e) => {
      sendData(e.target.parentElement.id, '/todo/delete', 'POST', (err, status) => {
        if (err) console.log(err)
        else console.log('Delete request sent via XHR')
        window.location.href = '/todo' // I'm sending 302 redirect request, but xhr has some issue because of which it doesn't redirect. Therefore using this to redirect
      })
    })
  })
}
