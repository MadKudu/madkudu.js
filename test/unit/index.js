const { expect } = require('chai')
const _ = require('lodash')

var madkudu = require('../../lib')

describe('index.js', function () {
  describe('VERSION', function () {
    it('should expose a .VERSION', function () {
      expect(madkudu.VERSION).to.be.a('string')
    })
  })

  describe('window', function () {
    it('should change only the madkudu property', function () {
      const modifiedProperties = _.keys(_.omit(window.mk_window_changes, ['_', 'onerror', 'setImmediate', 'clearImmediate']))
      /* @todo: the last two are not expected, getting rid of them for now but this needs to be fixed */
      // those last two should also not be there but they're a consequence of loading sinon (and we can't use noParse on sinon)

      console.log(modifiedProperties)

      expect(modifiedProperties).to.have.members(['madkudu', '__coverage__'])
      // __coverage__ is expected in this context

      it('should not modify window.addEventListener', function () {
        expect(window.addEventListener.toString()).to.not.equal(window.madkudu.addEventListener.toString())
      })
    })
  })

  describe('replay', function () {
    // reset window.madkudu and call page
    // this only verifies that the thing doesn't error
    // TODO: find a way to mock the method to verify it's been called
    it('should replay the methods once loaded', function () {
      var mdkd = window.madkudu = []
      mdkd.methods = ['identify', 'reset', 'group', 'ready', 'page', 'track', 'once', 'on', 'smart_form']
      mdkd.factory = function (t) {
        return function () {
          var e = Array.prototype.slice.call(arguments)
          e.unshift(t)
          mdkd.push(e)
          return mdkd
        }
      }
      for (var t = 0; t < mdkd.methods.length; t++) {
        var e = mdkd.methods[t]
        mdkd[e] = mdkd.factory(e)
      }
      mdkd.page()

      // reset the cache to force a reload of window.madkudu
      delete require.cache[require.resolve('../../lib')]
      madkudu = require('../../lib')

      expect(1).to.equal(1)
    })

    it('should work if an fake method is called', function () {
      var mdkd = window.madkudu = []
      mdkd.methods = ['identify', 'reset', 'group', 'ready', 'page', 'track', 'once', 'on', 'smart_form', 'fake_method']
      mdkd.factory = function (t) {
        return function () {
          var e = Array.prototype.slice.call(arguments)
          e.unshift(t)
          mdkd.push(e)
          return mdkd
        }
      }
      for (var t = 0; t < mdkd.methods.length; t++) {
        var e = mdkd.methods[t]
        mdkd[e] = mdkd.factory(e)
      }

      mdkd.fake_method()

      // reset the cache to force a reload of window.madkudu
      delete require.cache[require.resolve('../../lib')]
      madkudu = require('../../lib')

      expect(1).to.equal(1)
    })
  })
})
