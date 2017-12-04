const chai = require('chai')
const expect = chai.expect

describe('jquery', function () {
  before(function (done) {
    // Wait the loading of analytics.js
    window.madkudu.ready(function () {
      done()
    })
  })

  it('should load madkudu in the window', function () {
    expect(window.madkudu).to.be.an('object')
  })

  it('should not modify the current jquery', function () {
    expect(window.mk_window_changes).to.not.include.keys(['$', 'jQuery'])
  })
})
