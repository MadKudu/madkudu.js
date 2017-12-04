before(done => {
  window.require(['./base/madkudu.min.js'], madkudu => {
    window.madkudu = madkudu
    done()
  })
})
