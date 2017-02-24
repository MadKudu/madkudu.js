
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const _ = require('lodash')

const Form = require('../../lib/form')
const madkudu = require('../../lib')
const MadKudu = madkudu.constructor

var user = madkudu.user()

describe('form', function () {
  describe('Form', function () {
    var madkudu

    beforeEach(function () {
      madkudu = new MadKudu()
      madkudu.timeout(0)
    })

    // afterEach(function () {
    //   user.reset();
    //   user.anonymousId(null);
    // });

    it('should have a reference to the parent madkudu object', function () {
      var form = new Form(madkudu)
      expect(form.madkudu).to.equal(madkudu)
    })

    it('should instantiate correctly with incomplete settings', function () {
      const settings = { trigger: { js: '(function () {})();' } }
      var form = new Form(madkudu)
      expect(form.madkudu).to.equal(madkudu, settings)
    })
  })

  describe('#init', function () {
    var madkudu

    beforeEach(function () {
      madkudu = new MadKudu()
      madkudu.timeout(0)
    })

    it('should call the initialization methods', function () {
      var form = new Form(madkudu)
      form.initialize_variation = sinon.spy()
      form.initialize_events = sinon.spy()
      form.init()
      sinon.assert.called(form.initialize_events)
      sinon.assert.called(form.initialize_variation)
    })

    it('should emit initialized', function (done) {
      var form = new Form(madkudu)
      form.on('initialized', () => {
        done()
      })
      form.init()
    })
  })

  describe('#initialize_variation', function () {
    var madkudu

    beforeEach(function () {
      madkudu = new MadKudu()
      madkudu.timeout(0)
    })

    it('should return if no variations', function () {
      var form = new Form(madkudu)
      expect(form.initialize_variation()).to.equal(form)
    })

    it('should not instantiate a trigger if no variation provided', function () {
      const settings = { trigger: { js: '(function () {})();' } }
      var form = new Form(madkudu, settings)
      form.initialize_variation()
      expect(form._trigger).to.be.an('undefined')
    })

    it('should instantiate a trigger and variation', function () {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      var form = new Form(madkudu, settings)
      form.initialize_variation()
      expect(form._trigger).to.be.a('function')
      expect(form.trigger).to.be.a('function')
      expect(form._on_qualify).to.be.a('function')
      expect(form.on_qualify).to.be.a('function')
      expect(form._on_qualify_results).to.be.a('function')
      expect(form.on_qualify_results).to.be.a('function')
      expect(form._on_qualified).to.be.a('function')
      expect(form.on_qualified).to.be.a('function')
      expect(form._on_request).to.be.a('function')
      expect(form.on_request).to.be.a('function')
    })
  })

  describe('#initialize_events', function () {
    it('should instantiate event listener for each events', function (done) {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      var form = new Form(madkudu, settings)
      form.init()
      const properties = { a: 'b' }
      form.on('qualify', props => {
        expect(props).to.equal(properties)
        done()
      })
      form.emit('qualify', properties)
    })
  })

  describe('#start', function () {
    var form

    beforeEach(function () {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      form = new Form(madkudu, settings)
      form.init()
    })

    it('should call load if verify_location returns true', function () {
      form.verify_location = sinon.stub().returns(true)
      form.load = sinon.spy()
      form.start()
      sinon.assert.called(form.load)
    })

    it('should not call load if verify_location returns false', function () {
      form.verify_location = sinon.stub().returns(false)
      form.load = sinon.spy()
      form.start()
      sinon.assert.notCalled(form.load)
    })
  })

  describe('#load', function () {
    var form

    beforeEach(function () {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      form = new Form(madkudu, settings)
      form.init()
    })

    it('should call the form if not already loaded', function () {
      sinon.spy(form, 'on_load')
      sinon.spy(form, 'track')
      sinon.spy(form, 'parse_query_string')
      sinon.spy(form, 'trigger')
      form.load()
      sinon.assert.called(form.on_load)
      sinon.assert.calledWith(form.track, 'loaded')
      sinon.assert.called(form.trigger)
    })

    it('should call each method only once', function () {
      sinon.spy(form, 'on_load')
      sinon.spy(form, 'track')
      sinon.spy(form, 'parse_query_string')
      sinon.spy(form, 'trigger')
      form.load()
      form.load()
      sinon.assert.calledOnce(form.on_load)
      sinon.assert.calledOnce(form.track)
      sinon.assert.calledOnce(form.trigger)
    })
  })

  describe('#actions', function () {
    var form

    beforeEach(function () {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      form = new Form(madkudu, settings)
      form.init()
    })

    it('should call the corresponding user-defined method', function () {
      _.each(['request', 'qualified', 'not_qualified', 'qualify_results'], action => {
        sinon.spy(form, 'on_' + action)
        form[action]()
        sinon.assert.called(form['on_' + action])
      })
    })
  })

  describe('#set_email', function () {
    var form
    var madkudu

    beforeEach(function () {
      madkudu = new MadKudu()
      madkudu.timeout(0)
    })

    beforeEach(function () {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      form = new Form(madkudu, settings)
      form.init()
    })

    afterEach(function () {
      user.reset()
      user.anonymousId(null)
    })

    it('should set the email ', function () {
      const email = 'test@madkudu.com'
      form.set_email(email)
      expect(form.email).to.equal(email)
    })

    it('should call identify with the email', function () {
      const email = 'test@madkudu.com'
      sinon.spy(madkudu, 'identify')
      form.set_email(email)
      sinon.assert.calledWith(madkudu.identify, { email: email })
    })

    it('should set the the email trait of the user', function () {
      const email = 'test@madkudu.com'
      expect(user.traits()).to.deep.equal({})
      form.set_email(email)
      expect(user.traits()).to.deep.equal({ email: email })
    })
  })

  describe('#is_email', function () {
    var form

    beforeEach(function () {
      const settings = { trigger: { js: '(function () {})();' }, variations: [ { name: 'variation ' } ] }
      form = new Form(madkudu, settings)
      form.init()
    })

    it('should return true for a valid email', function () {
      expect(form.is_email('test@madkudu.com')).to.be.true
    })

    it('should return false for an invalid email', function () {
      expect(form.is_email('test.madkudu.com')).to.be.false
    })
  })
})
