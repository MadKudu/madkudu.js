const chai = require('chai')
const expect = chai.expect

describe('window.madkudu', function () {
  it('should emit the ready callback', function (done) {
    window.madkudu.ready(function () {
      done()
    })
  })

  it('should have loaded madkudu into window.madkudu', function () {
    expect(window.madkudu).to.be.an('object')
  })

  it('should instantiate options and settings', function () {
    const madkudu = window.madkudu
    expect(madkudu.VERSION).to.be.a('string')
    expect(madkudu.forms).to.be.an('array')
  })

  it('should not expose jquery', function () {
    expect(window['jQuery']).to.be.an('undefined')
    expect(window['$']).to.be.an('undefined')
  })
})

describe('settings', function () {
  it('should instantiate the settings on load', function () {
    const madkudu = window.madkudu
    expect(madkudu.settings).to.be.an('object')
  })

  it('should have properties', function () {
    const madkudu = window.madkudu
    expect(madkudu.settings.api_key).to.be.a('string')
    expect(madkudu.settings.form).to.be.an('object')
    expect(madkudu.settings.form.active).to.be.a('boolean')
    expect(madkudu.settings.form.campaigns).to.be.an('array')
  })
})
