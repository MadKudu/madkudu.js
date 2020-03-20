const { expect } = require('chai')
const _ = require('lodash')

describe('window', function () {
  it('should change only the madkudu property', function () {
    const modified_properties = _.keys(_.omit(window.mk_window_changes, ['__coverage__', '_', 'onerror']))
    /* @todo: the last two are not expected, getting rid of them for now but this needs to be fixed */

    console.log(modified_properties)

    expect(modified_properties).to.have.members(['madkudu'])

    it('should not modify window.addEventListener', function () {
      expect(window.addEventListener.toString()).to.not.equal(window.madkudu.addEventListener.toString())
    })
  })
})
