'use strict'

var chai = require('chai')
var assert = chai.assert
var expect = chai.expect

var rawCookie = require('component-cookie')
var sinon = require('sinon')
var madkudu = require('../../lib')

var cookie = require('../../lib/cookie')
var store = require('../../lib/store')
var memory = require('../../lib/memory')
var user = madkudu.user()
var User = user.User

describe('user', function () {
  var cookieKey = user._options.cookie.key
  var localStorageKey = user._options.localStorage.key

  beforeEach(function () {
    user = new User()
    user.reset()
  })

  afterEach(function () {
    user.reset()
    cookie.remove(cookieKey)
    store.remove(cookieKey)
    store.remove(localStorageKey)
    store.remove('_sio')
    cookie.remove('_sio')
    rawCookie('_sio', null)
  })

  describe('()', function () {
    beforeEach(function () {
      cookie.set(cookieKey, 'my id')
      store.set(localStorageKey, { trait: true })
    })

    it('should not reset user id and traits', function () {
      var user = new User()
      assert(user.id() === 'my id')
      assert(user.traits().trait === true)
    })

    it('should create anonymous id if missing', function () {
      var user = new User()
      assert(user.anonymousId().length === 36)
    })

    it('should not overwrite anonymous id', function () {
      cookie.set('mkjs_anonymous_id', 'anonymous')
      assert(new User().anonymousId() === 'anonymous')
    })
  })

  describe('#id', function () {
    describe('when cookies are disabled', function () {
      beforeEach(function () {
        sinon.stub(cookie, 'get').callsFake(function () {})
        user = new User()
      })

      afterEach(function () {
        cookie.get.restore()
      })

      it('should get an id from the store', function () {
        store.set(cookieKey, 'id')
        assert(user.id() === 'id')
      })

      it('should get an id when not persisting', function () {
        user.options({ persist: false })
        user._id = 'id'
        assert(user.id() === 'id')
      })

      it('should set an id to the store', function () {
        user.id('id')
        assert(store.get(cookieKey) === 'id')
      })

      it('should set the id when not persisting', function () {
        user.options({ persist: false })
        user.id('id')
        assert(user._id === 'id')
      })

      it('should be null by default', function () {
        assert(user.id() === null)
      })

      it('should not reset anonymousId if the user didnt have previous id', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id('foo')
        user.id('foo')
        assert(user.anonymousId() === prev)
      })

      it('should reset anonymousId if the user id changed', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id('baz')
        assert(user.anonymousId() !== prev)
        assert(user.anonymousId().length === 36)
      })

      it('should not reset anonymousId if the user id changed to null', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id(null)
        assert(user.anonymousId() === prev)
        assert(user.anonymousId().length === 36)
      })
    })

    describe('when cookies and localStorage are disabled', function () {
      beforeEach(function () {
        sinon.stub(cookie, 'get').callsFake(function () {})
        store.enabled = false
        user = new User()
      })

      afterEach(function () {
        store.enabled = true
        cookie.get.restore()
      })

      it('should get an id from the memory', function () {
        memory.set(cookieKey, 'id')
        assert(user.id() === 'id')
      })

      it('should get an id when not persisting', function () {
        user.options({ persist: false })
        user._id = 'id'
        assert(user.id() === 'id')
      })

      it('should set an id to the memory', function () {
        user.id('id')
        assert(memory.get(cookieKey) === 'id')
      })

      it('should set the id when not persisting', function () {
        user.options({ persist: false })
        user.id('id')
        assert(user._id === 'id')
      })

      it('should be null by default', function () {
        assert(user.id() === null)
      })

      it('should not reset anonymousId if the user didnt have previous id', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id('foo')
        user.id('foo')
        assert(user.anonymousId() === prev)
      })

      it('should reset anonymousId if the user id changed', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id('baz')
        assert(user.anonymousId() !== prev)
        assert(user.anonymousId().length === 36)
      })

      it('should not reset anonymousId if the user id changed to null', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id(null)
        assert(user.anonymousId() === prev)
        assert(user.anonymousId().length === 36)
      })
    })

    describe('when cookies are enabled', function () {
      it('should get an id from the cookie', function () {
        cookie.set(cookieKey, 'id')
        assert(user.id() === 'id')
      })

      it('should get an id when not persisting', function () {
        user.options({ persist: false })
        user._id = 'id'
        assert(user.id() === 'id')
      })

      it('should set an id to the cookie', function () {
        user.id('id')
        assert(cookie.get(cookieKey) === 'id')
      })

      it('should set the id when not persisting', function () {
        user.options({ persist: false })
        user.id('id')
        assert(user._id === 'id')
      })

      it('should be null by default', function () {
        assert(user.id() === null)
      })

      it('should not reset anonymousId if the user didnt have previous id', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id('foo')
        user.id('foo')
        assert(user.anonymousId() === prev)
      })

      it('should reset anonymousId if the user id changed', function () {
        var prev = user.anonymousId()
        user.id('foo')
        user.id('baz')
        assert(user.anonymousId() !== prev)
        assert(user.anonymousId().length === 36)
      })
    })
  })

  describe('#anonymousId', function () {
    var noop = { set: function () {}, get: function () {} }
    var storage = user.storage

    afterEach(function () {
      user.storage = storage
    })

    describe('when cookies are disabled', function () {
      beforeEach(function () {
        sinon.stub(cookie, 'get').callsFake(function () {})
        user = new User()
      })

      afterEach(function () {
        cookie.get.restore()
      })

      it('should get an id from the store', function () {
        store.set('mkjs_anonymous_id', 'anon-id')
        assert(user.anonymousId() === 'anon-id')
      })

      it('should set an id to the store', function () {
        user.anonymousId('anon-id')
        assert(store.get('mkjs_anonymous_id') === 'anon-id')
      })

      it('should return anonymousId using the store', function () {
        user.storage = function () { return noop }
        assert(user.anonymousId() === undefined)
      })
    })

    describe('when cookies and localStorage are disabled', function () {
      beforeEach(function () {
        sinon.stub(cookie, 'get').callsFake(function () {})
        store.enabled = false
        user = new User()
      })

      afterEach(function () {
        store.enabled = true
        cookie.get.restore()
      })

      it('should get an id from the memory', function () {
        memory.set('mkjs_anonymous_id', 'anon-id')
        assert(user.anonymousId() === 'anon-id')
      })

      it('should set an id to the memory', function () {
        user.anonymousId('anon-id')
        assert(memory.get('mkjs_anonymous_id') === 'anon-id')
      })

      it('should return anonymousId using the store', function () {
        user.storage = function () { return noop }
        assert(user.anonymousId() === undefined)
      })
    })

    describe('when cookies are enabled', function () {
      it('should get an id from the cookie', function () {
        cookie.set('mkjs_anonymous_id', 'anon-id')
        assert(user.anonymousId() === 'anon-id')
      })

      it('should set an id to the cookie', function () {
        user.anonymousId('anon-id')
        assert(cookie.get('mkjs_anonymous_id') === 'anon-id')
      })

      it('should return anonymousId using the store', function () {
        user.storage = function () { return noop }
        assert(user.anonymousId() === undefined)
      })
    })
  })

  describe('#traits', function () {
    it('should get traits', function () {
      store.set(localStorageKey, { trait: true })
      assert.deepEqual(user.traits(), { trait: true })
    })

    it('should get a copy of traits', function () {
      store.set(localStorageKey, { trait: true })
      assert(user.traits() !== user._traits)
    })

    it('should get traits when not persisting', function () {
      user.options({ persist: false })
      user._traits = { trait: true }
      assert.deepEqual(user.traits(), { trait: true })
    })

    it('should get a copy of traits when not persisting', function () {
      user.options({ persist: false })
      user._traits = { trait: true }
      assert(user.traits() !== user._traits)
    })

    it('should set traits', function () {
      user.traits({ trait: true })
      assert(store.get(localStorageKey), { trait: true })
    })

    it('should set the id when not persisting', function () {
      user.options({ persist: false })
      user.traits({ trait: true })
      assert.deepEqual(user._traits, { trait: true })
    })

    it('should default traits to an empty object', function () {
      user.traits(null)
      assert.deepEqual(store.get(localStorageKey), {})
    })

    it('should default traits to an empty object when not persisting', function () {
      user.options({ persist: false })
      user.traits(null)
      assert.deepEqual(user._traits, {})
    })

    it('should be an empty object by default', function () {
      assert.deepEqual(user.traits(), {})
    })
  })

  describe('#options', function () {
    it('should get options', function () {
      assert(user.options() === user._options)
    })

    it('should set options with defaults', function () {
      user.options({ option: true })
      assert.deepEqual(user._options, {
        option: true,
        persist: true,
        cookie: {
          key: 'mkjs_user_id',
          oldKey: 'mkjs_user'
        },
        localStorage: {
          key: 'mkjs_user_traits'
        }
      })
    })
  })

  describe('#save', function () {
    it('should save an id to a cookie', function () {
      user.id('id')
      user.save()
      assert(cookie.get(cookieKey) === 'id')
    })

    it('should save traits to local storage', function () {
      user.traits({ trait: true })
      user.save()
      assert(store.get(localStorageKey), { trait: true })
    })

    it('shouldnt save if persist is false', function () {
      user.options({ persist: false })
      user.id('id')
      user.save()
      assert(cookie.get(cookieKey) === null)
    })
  })

  describe('#logout', function () {
    it('should reset an id and traits', function () {
      user.id('id')
      user.anonymousId('anon-id')
      user.traits({ trait: true })
      user.logout()
      assert(cookie.get('mkjs_anonymous_id') === null)
      assert(user.id() === null)
      assert(user.traits(), {})
    })

    it('should clear a cookie', function () {
      user.id('id')
      user.save()
      user.logout()
      assert(cookie.get(cookieKey) === null)
    })

    it('should clear local storage', function () {
      user.traits({ trait: true })
      user.save()
      user.logout()
      assert(store.get(localStorageKey) === undefined)
    })
  })

  describe('#identify', function () {
    it('should save an id', function () {
      user.identify('id')
      assert(user.id() === 'id')
      assert(cookie.get(cookieKey) === 'id')
    })

    it('should save traits', function () {
      user.identify(null, { trait: true })
      assert.deepEqual(user.traits(), { trait: true })
      assert.deepEqual(store.get(localStorageKey), { trait: true })
    })

    it('should save an id and traits', function () {
      user.identify('id', { trait: true })
      assert(user.id() === 'id')
      assert.deepEqual(user.traits(), { trait: true })
      assert(cookie.get(cookieKey) === 'id')
      assert.deepEqual(store.get(localStorageKey), { trait: true })
    })

    it('should extend existing traits', function () {
      user.traits({ one: 1 })
      user.identify('id', { two: 2 })
      assert.deepEqual(user.traits(), { one: 1, two: 2 })
      assert.deepEqual(store.get(localStorageKey), { one: 1, two: 2 })
    })

    it('shouldnt extend existing traits for a new id', function () {
      user.id('id')
      user.traits({ one: 1 })
      user.identify('new', { two: 2 })
      assert.deepEqual(user.traits(), { two: 2 })
      assert.deepEqual(store.get(localStorageKey), { two: 2 })
    })

    it('should reset traits for a new id', function () {
      user.id('id')
      user.traits({ one: 1 })
      user.identify('new')
      assert.deepEqual(user.traits(), {})
      assert.deepEqual(store.get(localStorageKey), {})
    })
  })

  describe('#load', function () {
    it('should load an empty user', function () {
      user.load()
      assert(user.id() === null)
      assert.deepEqual(user.traits(), {})
    })

    it('should load an id from a cookie', function () {
      cookie.set(cookieKey, 'id')
      user.load()
      assert(user.id() === 'id')
    })

    it('should load traits from local storage', function () {
      store.set(localStorageKey, { trait: true })
      user.load()
      assert.deepEqual(user.traits(), { trait: true })
    })
  })

  describe('#customer_fit', function () {
    it('should return the customer_fit trait', function () {
      const customer_fit = { segment: 'good' }
      user.identify(user.id(), { customer_fit: customer_fit })
      expect(user.customer_fit()).to.deep.equal(customer_fit)
    })
  })

  describe('#customer_fit_segment', function () {
    it('should return the customer_fit segment', function () {
      const customer_fit = { segment: 'good' }
      user.identify(user.id(), { customer_fit: customer_fit })
      expect(user.customer_fit_segment()).to.equal(customer_fit.segment)
    })
  })

  describe('#_is_qualified', function () {
    it('should return true for good / very good', function () {
      expect(user._is_qualified('good')).to.equal(true)
      expect(user._is_qualified('very good')).to.equal(true)
    })

    it('should return false otherwise', function () {
      expect(user._is_qualified('medium')).to.equal(false)
      expect(user._is_qualified('low')).to.equal(false)
      expect(user._is_qualified('foo')).to.equal(false)
    })
  })

  describe('#is_qualified', function () {
    it('should return true for good / very good', function () {
      user.identify(user.id(), { customer_fit: { segment: 'good' } })
      expect(user.is_qualified()).to.equal(true)
    })

    it('should return false otherwise', function () {
      user.identify(user.id(), { customer_fit: { segment: 'low' } })
      expect(user.is_qualified()).to.equal(false)
    })
  })

  describe('#persons', function () {
    before(function () {
      sinon.spy(window.madkudu, 'persons')
    })

    it('should pass the user traits to madkudu.persons', function () {
      const traits = { email: 'test@madkudu.com' }
      user.traits = sinon.stub().returns(traits)

      user.persons()

      sinon.assert.called(user.traits)
      sinon.assert.calledWith(window.madkudu.persons, { email: traits.email }, undefined)
    })

    after(function () {
      window.madkudu.persons.restore()
    })
  })

  describe('#qualify', function () {
    before(function () {
      sinon.stub(window.madkudu, 'persons')
    })

    it('should call persons', function () {
      user.persons = sinon.spy()
      user.qualify()
      sinon.assert.called(user.persons)
    })

    it('should call identify with the results', function () {
      const results = {
        properties: {
          domain: 'madkudu.com',
          customer_fit: {
            segment: 'very good'
          }
        },
        company: {}
      }

      user.identify = sinon.spy()
      window.madkudu.persons.callsArgWith(1, null, results)

      user.qualify()

      sinon.assert.called(user.identify)
    })

    it('should work if persons does not return results', function () {
      user.identify = sinon.spy()
      window.madkudu.persons.callsArgWith(1, null, null)

      user.qualify()

      sinon.assert.called(user.identify)
    })

    it('should call the callback if provided', function () {
      const results = {}

      const callback = sinon.spy()
      window.madkudu.persons.callsArgWith(1, null, results)

      user.qualify(callback)

      sinon.assert.called(callback)
    })

    it('should pass the error to the callback', function () {
      const err = new Error('test')

      const callback = sinon.spy()
      window.madkudu.persons.callsArgWith(1, err)

      user.qualify(callback)

      sinon.assert.calledWith(callback, err)
    })

    after(function () {
      window.madkudu.persons.restore()
    })
  })
})
