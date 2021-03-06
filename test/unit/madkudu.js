const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const sinon = require('sinon')

const madkudu = require('../../lib')
const MadKudu = madkudu.constructor
const tick = require('next-tick')
const protocol = require('@segment/protocol')

const cookie = require('../../lib/cookie')
const store = require('../../lib/store')
const user = madkudu.user()

describe('MadKudu', function () {
  let madkudu

  beforeEach(function () {
    madkudu = new MadKudu()
    madkudu.timeout(0)
  })

  afterEach(function () {
    user.reset()
    user.anonymousId(null)
  })

  it('should set a _readied state', function () {
    assert(madkudu._readied === false)
  })

  it('should set a default timeout', function () {
    madkudu = new MadKudu()
    assert(madkudu._timeout === 300)
  })

  it('should set the _user for backwards compatibility', function () {
    assert(madkudu._user === user)
  })

  describe('#setAnonymousId', function () {
    it('should set the user\'s anonymous id', function () {
      const prev = madkudu.user().anonymousId()
      assert(prev.length === 36)
      madkudu.setAnonymousId('new-id')
      const curr = madkudu.user().anonymousId()
      assert(curr === 'new-id')
    })
  })

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.spy(user, 'load')
    })

    afterEach(function () {
      user.load.restore()
    })

    it('should not error without settings', function () {
      madkudu.initialize()
    })

    it('should set options', function () {
      madkudu._options = sinon.spy()
      madkudu.initialize({}, { option: true })
      sinon.assert.calledWith(madkudu._options, { option: true })
    })

    it('should set analytics._readied to true', function (done) {
      madkudu.ready(function () {
        assert(madkudu._readied)
        done()
      })
      madkudu.initialize()
    })

    it('should call #load on the user', function () {
      madkudu.initialize()
      sinon.assert.called(user.load)
    })

    it('should emit initialize', function (done) {
      madkudu.once('initialize', function () {
        done()
      })
      madkudu.initialize()
    })

    it('should call page if options.initialPageview', function (done) {
      madkudu.once('initialize', function () {
        done()
      })
      madkudu.initialize(undefined, { initialPageview: true })
    })

    it('should only initialize once', function () {
      madkudu._init_forms = sinon.spy()
      madkudu.smart_form = sinon.spy()
      madkudu.initialize()
      sinon.assert.calledOnce(madkudu._init_forms)
      sinon.assert.calledOnce(user.load)
    })
  })

  describe('#ready', function () {
    it('should push a handler on to the queue', function (done) {
      madkudu.ready(done)
      madkudu.emit('ready')
    })

    it('should callback on next tick when already ready', function (done) {
      madkudu.ready(function () {
        const spy = sinon.spy()
        madkudu.ready(spy)
        assert(!spy.called)
        tick(function () {
          assert(spy.called)
          done()
        })
      })
      madkudu.initialize()
    })

    it('should emit ready', function (done) {
      madkudu.once('ready', done)
      madkudu.initialize()
    })

    it('should not error when passed a non-function', function () {
      madkudu.ready('callback')
    })
  })

  describe('#_options', function () {
    beforeEach(function () {
      sinon.stub(cookie, 'options')
      sinon.stub(store, 'options')
      sinon.stub(user, 'options')
    })

    afterEach(function () {
      cookie.options.restore()
      store.options.restore()
      user.options.restore()
    })

    it('should set cookie options', function () {
      madkudu._options({ cookie: { option: true } })
      assert(cookie.options.calledWith({ option: true }))
    })

    it('should set store options', function () {
      madkudu._options({ localStorage: { option: true } })
      assert(store.options.calledWith({ option: true }))
    })

    it('should set user options', function () {
      madkudu._options({ user: { option: true } })
      assert(user.options.calledWith({ option: true }))
    })
  })

  describe('#_timeout', function () {
    it('should set the timeout for callbacks', function () {
      madkudu.timeout(500)
      assert(madkudu._timeout === 500)
    })
  })

  describe('#_callback', function () {
    it('should callback on nextTick if timeout = 0', function (done) {
      const spy = sinon.spy()
      madkudu._callback(spy)
      assert(!spy.called)
      tick(function () {
        assert(spy.called)
        done()
      })
    })
  })

  describe('#_callback', function () {
    it('should callback after a timeout', function (done) {
      madkudu.timeout(50)
      const spy = sinon.spy()
      madkudu._callback(spy)
      assert(!spy.called)
      setTimeout(function () {
        assert(spy.called)
        done()
      }, 60)
    })
  })

  describe('#user', function () {
    it('should return the user singleton', function () {
      assert(madkudu.user() === user)
    })
  })

  describe('#reset', function () {
    beforeEach(function () {
      user.id('user-id')
      user.traits({ name: 'John Doe' })
    })

    it('should remove persisted group and user', function () {
      assert(user.id() === 'user-id')
      assert(user.traits().name === 'John Doe')
      madkudu.reset()
      assert(user.id() === null)
      assert.deepEqual({}, user.traits())
    })
  })

  describe('#identify', function () {
    it('should call user.identify with traits', function () {
      const user = madkudu.user()
      user.identify = sinon.stub()
      const traits = { trait: true }
      madkudu.identify('id', traits)
      sinon.assert.calledWith(user.identify, 'id', traits)
    })

    it('should callback after a timeout', function (done) {
      const spy = sinon.spy()
      const traits = { trait: true }
      madkudu.identify('id', traits, null, spy)
      assert(!spy.called)
      tick(function () {
        assert(spy.called)
        done()
      })
    })
  })

  describe('#group', function () {
    it('should call user.group with traits', function () {
      const user = madkudu.user()
      user.group = sinon.stub()
      const traits = { trait: true }
      madkudu.group('id', traits)
      sinon.assert.calledWith(user.group, 'id', traits)
    })

    it('should callback after a timeout', function (done) {
      const spy = sinon.spy()
      const traits = { trait: true }
      madkudu.group('id', traits, null, spy)
      assert(!spy.called)
      tick(function () {
        assert(spy.called)
        done()
      })
    })

    // NDPaul: uh?
    // it('should return the user if no argument', function () {
    //   assert(madkudu.group() === madkudu.group())
    // })
  })

  describe('#track', function () {
    beforeEach(function () {
      sinon.stub(madkudu, 'send')
    })

    it('should send event / properties / context', function () {
      madkudu.track('event', { prop: true }, { opt: true })
      var args = madkudu.send.args[0]
      assert(args[0] === '/track')
      assert(args[1].event === 'event')
      assert(args[1].context.opt === true)
      assert(args[1].properties.prop === true)
      assert(args[1].traits == null)
    })

    it('should assign a default context', function () {
      madkudu.track('event', { prop: true })
      var args = madkudu.send.args[0]
      assert(args[0] === '/track')
      assert(args[1].event === 'event')
      assert(args[1].properties.prop === true)
      assert(args[1].traits == null)
    })
  })

  describe('#send', function () {
    // beforeEach(function () {
    //   analytics.spy(madkudu, 'session');
    // });

    it('should use https: protocol when http:', function () {
      const xhr = sinon.useFakeXMLHttpRequest()
      const spy = sinon.spy()
      xhr.onCreate = spy

      protocol('http:')
      madkudu.send('/track', { userId: 'id' })

      sinon.assert.calledOnce(spy)
      var req = spy.getCall(0).args[0]
      assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track')
    })

    it('should use https: protocol when https:', function () {
      const xhr = sinon.useFakeXMLHttpRequest()
      const spy = sinon.spy()
      xhr.onCreate = spy

      protocol('https:')
      madkudu.send('/track', { userId: 'id' })

      sinon.assert.calledOnce(spy)
      var req = spy.getCall(0).args[0]
      assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track')
    })

    it('should use https: protocol when https:', function () {
      const xhr = sinon.useFakeXMLHttpRequest()
      const spy = sinon.spy()
      xhr.onCreate = spy

      protocol('file:')
      madkudu.send('/track', { userId: 'id' })

      sinon.assert.calledOnce(spy)
      var req = spy.getCall(0).args[0]
      assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track')
    })

    it('should use https: protocol when chrome-extension:', function () {
      const xhr = sinon.useFakeXMLHttpRequest()
      const spy = sinon.spy()
      xhr.onCreate = spy

      protocol('chrome-extension:')
      madkudu.send('/track', { userId: 'id' })

      sinon.assert.calledOnce(spy)
      var req = spy.getCall(0).args[0]
      assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track')
    })

    it('should send to `api.madkudu.com/v1` by default', function () {
      const xhr = sinon.useFakeXMLHttpRequest()
      const spy = sinon.spy()
      xhr.onCreate = spy

      protocol('https:')
      madkudu.send('/track', { userId: 'id' })

      sinon.assert.calledOnce(spy)
      var req = spy.getCall(0).args[0]
      assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track')
    })

    it('should send a normalized payload', function () {
      const xhr = sinon.useFakeXMLHttpRequest()
      const spy = sinon.spy()
      xhr.onCreate = spy

      var payload = {
        key1: 'value1',
        key2: 'value2'
      }

      madkudu.normalize = function () { return payload }

      madkudu.send('/track', {})

      sinon.assert.calledOnce(spy)
      var req = spy.getCall(0).args[0]
      assert.strictEqual(req.requestBody, JSON.stringify(payload))
    })

    describe('beacon', function () {
      beforeEach(function () {
        navigator.sendBeacon = sinon.stub().returns(true)
      })

      it('should default to ajax', function () {
        const beacon = navigator.sendBeacon

        const ajax = sinon.spy()
        const xhr = sinon.useFakeXMLHttpRequest()
        xhr.onCreate = ajax

        madkudu.send('/track', { userId: 'id' })

        assert(!beacon.called)
        assert(ajax.calledOnce)
      })

      it('should call beacon', function () {
        const beacon = navigator.sendBeacon

        madkudu.options.beacon = true

        madkudu.send('/track', { userId: 'id' })

        sinon.assert.calledOnce(beacon)
        var args = beacon.getCall(0).args
        assert.strictEqual(args[0], 'https://api.madkudu.com/v1/track')
        assert(typeof args[1] === 'string')
      })

      it('should not fallback to ajax on beacon success', function () {
        const beacon = navigator.sendBeacon

        const ajax = sinon.spy()
        const xhr = sinon.useFakeXMLHttpRequest()
        xhr.onCreate = ajax

        madkudu.options.beacon = true

        madkudu.send('/track', { userId: 'id' })

        sinon.assert.calledOnce(beacon)
        sinon.assert.notCalled(ajax)
      })

      it('should fallback to ajax on beacon failure', function () {
        navigator.sendBeacon = sinon.stub().returns(false)
        const beacon = navigator.sendBeacon

        const ajax = sinon.spy()
        const xhr = sinon.useFakeXMLHttpRequest()
        xhr.onCreate = ajax

        madkudu.options.beacon = true

        madkudu.send('/track', { userId: 'id' })

        sinon.assert.calledOnce(beacon)
        sinon.assert.calledOnce(ajax)
      })

      it('should fallback to ajax if beacon is not supported', function () {
        navigator.sendBeacon = null

        const ajax = sinon.spy()
        const xhr = sinon.useFakeXMLHttpRequest()
        xhr.onCreate = ajax

        madkudu.options.beacon = true

        madkudu.send('/track', { userId: 'id' })

        sinon.assert.calledOnce(ajax)
      })

      it('should execute callback with no arguments', function (done) {
        const beacon = navigator.sendBeacon

        const ajax = sinon.spy()
        const xhr = sinon.useFakeXMLHttpRequest()
        xhr.onCreate = ajax

        madkudu.options.beacon = true

        madkudu.send('/track', { userId: 'id' }, function (error, res) {
          assert(!error)
          assert(!res)
          assert(beacon.calledOnce)
          assert(!ajax.called)
          done()
        })
      })
    })

    it('should call the callback after sending', function (done) {
      var response = JSON.stringify({ text: 'mock' })

      madkudu._send_json = function (url, data, headers, fn) {
        var req = { response: response }
        fn(null, req)
      }

      var callback = sinon.spy()

      madkudu.send('/track', { email: 'a' }, callback)

      tick(function () {
        var args = callback.args[0]
        assert(args[0] === null)
        expect(args[1]).to.have.a.property('response', response)
        expect(args[1]).to.have.a.property('url')
        done()
      })
    })

    it('should callback with error if error in the request', function (done) {
      madkudu._send_json = function (url, data, headers, fn) {
        fn(new Error('bad request'))
      }

      var callback = sinon.spy()

      madkudu.send('/track', { email: 'a' }, callback)

      tick(function () {
        var args = callback.args[0]
        assert(args[0] instanceof Error)
        done()
      })
    })
  })

  describe('#request', function () {
    describe('fakeXhr', function () {
      it('should make an ajax request', function () {
        const ajax = sinon.spy()
        const xhr = sinon.useFakeXMLHttpRequest()
        xhr.onCreate = ajax

        madkudu.request('/persons', { email: 'a' })

        sinon.assert.calledOnce(ajax)
      })

      after(function () {
        sinon.useFakeXMLHttpRequest().restore()
      })
    })

    describe('mock send', function () {
      it('should return the parsed response in the callback', function (done) {
        var response = { text: 'mock' }

        madkudu._send_get = function (url, data, headers, fn) {
          var req = { response: JSON.stringify(response) }
          fn(null, req)
        }

        var callback = sinon.spy()

        madkudu.request('/persons', { email: 'a' }, callback)

        tick(function () {
          sinon.assert.calledWith(callback, null, response)
          done()
        })
      })

      it('should callback with error if unparseable json', function (done) {
        var response = { text: 'mock' }

        madkudu._send_get = function (url, data, headers, fn) {
          var req = { response: response }
          fn(null, req)
        }

        var callback = sinon.spy()

        madkudu.request('/persons', { email: 'a' }, callback)

        tick(function () {
          var args = callback.args[0]
          assert(args[0] instanceof Error)
          done()
        })
      })

      it('should callback with error if error in the request', function (done) {
        madkudu._send_get = function (url, data, headers, fn) {
          fn(new Error('bad request'))
        }

        var callback = sinon.spy()

        madkudu.request('/persons', { email: 'a' }, callback)

        tick(function () {
          var args = callback.args[0]
          assert(args[0] instanceof Error)
          done()
        })
      })
    })
  })

  describe('#persons', function () {
    beforeEach(function () {
      sinon.stub(madkudu, 'request')
    })

    it('should call request with route and data', function () {
      var data = {}
      madkudu.persons(data)
      sinon.assert.calledWith(madkudu.request, '/persons', data, undefined)
    })

    it('should call request with callback', function () {
      var data = {}
      var fn = sinon.spy()
      madkudu.persons(data, fn)
      sinon.assert.calledWith(madkudu.request, '/persons', data, fn)
    })
  })

  describe('#smart_form', function () {
    it('should not call smart_form on initialize if not active', function () {
      madkudu = new MadKudu()
      sinon.stub(madkudu, 'smart_form')

      var settings = {
        form: {
          active: false
        }
      }

      madkudu.initialize(settings)

      sinon.assert.notCalled(madkudu.smart_form)
    })

    it('should call smart_form on initialize if active', function () {
      madkudu = new MadKudu()
      sinon.stub(madkudu, 'smart_form')

      var settings = {
        form: {
          active: true
        }
      }
      madkudu.initialize(settings)

      sinon.assert.calledOnce(madkudu.smart_form)
    })
  })

  describe('#_start_forms', function () {
    it('should call start on each form', function () {
      var start = sinon.spy()
      madkudu.forms = [{ start: start }, { start: start }]
      madkudu._start_forms()
      sinon.assert.calledTwice(start)
    })
  })

  describe('#_init_form', function () {
    it('should add a form to the array and not return an error', function () {
      sinon.stub(madkudu, 'debug')
      madkudu._init_form({ name: 'a' })
      sinon.assert.notCalled(madkudu.debug)
      assert(madkudu.forms.length === 1)
    })

    // it('should not add the form and call debug if incomplete settings', function () {
    //   sinon.stub(madkudu, 'debug');
    //   madkudu._init_form();
    //   sinon.assert.calledOnce(madkudu.debug);
    //   expect(madkudu.forms).to.deep.equal([]);
    // });
  })

  describe('#_init_forms', function () {
    it('should start with an empty forms array', function () {
      expect(madkudu.forms).to.deep.equal([])
    })

    it('should not call init_form if no campaigns defined', function () {
      sinon.stub(madkudu, '_init_form')

      madkudu.settings = {
        api_key: 'api_key',
        form: {
          active: false,
          has_campaigns: false,
          campaigns: []
        }
      }

      madkudu._init_forms()

      sinon.assert.notCalled(madkudu._init_form)
    })

    it('should call init_form for each campaign', function () {
      sinon.stub(madkudu, '_init_form')

      madkudu.settings = {
        api_key: 'api_key',
        form: {
          active: false,
          has_campaigns: false,
          campaigns: [{ name: 'a' }, { name: 'b' }]
        }
      }

      madkudu._init_forms()

      sinon.assert.calledTwice(madkudu._init_form)
    })
  })
})
