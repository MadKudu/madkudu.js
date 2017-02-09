'use strict'

var chai = require('chai')
var expect = chai.expect

describe('MadKudu Snippet', function () {
  it('should emit the ready callback', function (done) {
    window.madkudu.ready(function () {
      done()
    })
  })

  it('should wait to load madkudu', function () {
    expect(window.madkudu).to.be.an('object')
  })
})
