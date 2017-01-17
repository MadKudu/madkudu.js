'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var sinon = require('sinon');

var madkudu = require('../../lib');

var MadKudu = madkudu.constructor;
var tick = require('next-tick');
var protocol = require('@segment/protocol');

var cookie = require('../../lib/cookie');
var store = require('../../lib/store');
var user = madkudu.user();

describe('MadKudu', function () {
	var madkudu;

	beforeEach(function () {
		madkudu = new MadKudu();
		madkudu.timeout(0);
	});

	afterEach(function () {
		user.reset();
		user.anonymousId(null);
	});

	it('should set a _readied state', function () {
		assert(madkudu._readied === false);
	});

	it('should set a default timeout', function () {
		madkudu = new MadKudu();
		assert(madkudu._timeout === 300);
	});

	it('should set the _user for backwards compatibility', function () {
		assert(madkudu._user === user);
	});

	describe('#setAnonymousId', function () {
		it('should set the user\'s anonymous id', function () {
			var prev = madkudu.user().anonymousId();
			assert(prev.length === 36);
			madkudu.setAnonymousId('new-id');
			var curr = madkudu.user().anonymousId();
			assert(curr === 'new-id');
		});
	});

	describe('#initialize', function () {
		beforeEach(function () {
			sinon.spy(user, 'load');
		});

		afterEach(function () {
			user.load.restore();
		});

		it('should not error without settings', function () {
			madkudu.initialize();
		});

		it('should set options', function () {
			madkudu._options = sinon.spy();
			madkudu.initialize({}, { option: true });
			assert(madkudu._options.calledWith({ option: true }));
		});

		it('should set analytics._readied to true', function (done) {
			madkudu.ready(function () {
				assert(madkudu._readied);
				done();
			});
			madkudu.initialize();
		});

		it('should call #load on the user', function () {
			madkudu.initialize();
			assert(user.load.called);
		});

		it('should emit initialize', function (done) {
			madkudu.once('initialize', function () {
				done();
			});
			madkudu.initialize();
		});

		it('should call page if options.initialPageview', function (done) {
			madkudu.once('initialize', function () {
				done();
			});
			madkudu.initialize(null, { initialPageview: true });
		});
	});

	describe('#ready', function () {
		it('should push a handler on to the queue', function (done) {
			madkudu.ready(done);
			madkudu.emit('ready');
		});

		it('should callback on next tick when already ready', function (done) {
			madkudu.ready(function () {
				var spy = sinon.spy();
				madkudu.ready(spy);
				assert(!spy.called);
				tick(function () {
					assert(spy.called);
					done();
				});
			});
			madkudu.initialize();
		});

		it('should emit ready', function (done) {
			madkudu.once('ready', done);
			madkudu.initialize();
		});

		it('should not error when passed a non-function', function () {
			madkudu.ready('callback');
		});
	});

	describe('#_options', function () {
		beforeEach(function () {
			sinon.stub(cookie, 'options');
			sinon.stub(store, 'options');
			sinon.stub(user, 'options');
		});

		afterEach(function () {
			cookie.options.restore();
			store.options.restore();
			user.options.restore();
		});

		it('should set cookie options', function () {
			madkudu._options({ cookie: { option: true } });
			assert(cookie.options.calledWith({ option: true }));
		});

		it('should set store options', function () {
			madkudu._options({ localStorage: { option: true } });
			assert(store.options.calledWith({ option: true }));
		});

		it('should set user options', function () {
			madkudu._options({ user: { option: true } });
			assert(user.options.calledWith({ option: true }));
		});

	});

	describe('#_timeout', function () {
		it('should set the timeout for callbacks', function () {
			madkudu.timeout(500);
			assert(madkudu._timeout === 500);
		});
	});

	describe('#_callback', function () {
		it('should callback on nextTick if timeout = 0', function (done) {
			var spy = sinon.spy();
			madkudu._callback(spy);
			assert(!spy.called);
			tick(function () {
				assert(spy.called);
				done();
			});
		});
	});

	describe('#_callback', function () {
		it('should callback after a timeout', function (done) {
			madkudu.timeout(50);
			var spy = sinon.spy();
			madkudu._callback(spy);
			assert(!spy.called);
			setTimeout(function () {
				assert(spy.called);
				done();
			}, 60);
		});
	});

	describe('#user', function () {
		it('should return the user singleton', function () {
			assert(madkudu.user() === user);
		});
	});

	describe('#reset', function () {
		beforeEach(function () {
			user.id('user-id');
			user.traits({ name: 'John Doe' });
		});

		it('should remove persisted group and user', function () {
			assert(user.id() === 'user-id');
			assert(user.traits().name === 'John Doe');
			madkudu.reset();
			assert(user.id() === null);
			assert.deepEqual({}, user.traits());
		});
	});

	describe('#identify', function () {
		it('should call user.identify with traits', function () {

			var user = madkudu.user();

			user.identify = sinon.stub();

			var traits = { trait: true };
			madkudu.identify('id', traits);

			sinon.assert.calledWith(user.identify, 'id', traits);
		});

		it('should callback after a timeout', function (done) {
			var spy = sinon.spy();
			var traits = { trait: true };
			madkudu.identify('id', traits, null, spy);
			assert(!spy.called);
			tick(function () {
				assert(spy.called);
				done();
			});
		});
	});

	describe('#track', function () {
		beforeEach(function () {
			sinon.stub(madkudu, 'send');
		});

		it('should send an event and properties', function () {
			madkudu.track('event', { prop: true }, { opt: true });
			var args = madkudu.send.args[0];
			assert(args[0] === '/track');
			assert(args[1].event === 'event');
			assert(args[1].context.opt === true);
			assert(args[1].properties.prop === true);
			assert(args[1].traits == null);
		});
	});

	describe('#send', function () {

		// beforeEach(function () {
		// 	analytics.spy(madkudu, 'session');
		// });

		it('should use https: protocol when http:', function () {
			var xhr = sinon.useFakeXMLHttpRequest();
			var spy = sinon.spy();
			xhr.onCreate = spy;

			protocol('http:');
			madkudu.send('/track', { userId: 'id' });

			sinon.assert.calledOnce(spy);
			var req = spy.getCall(0).args[0];
			assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track');
		});

		it('should use https: protocol when https:', function () {
			var xhr = sinon.useFakeXMLHttpRequest();
			var spy = sinon.spy();
			xhr.onCreate = spy;

			protocol('https:');
			madkudu.send('/track', { userId: 'id' });

			sinon.assert.calledOnce(spy);
			var req = spy.getCall(0).args[0];
			assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track');
		});

		it('should use https: protocol when https:', function () {
			var xhr = sinon.useFakeXMLHttpRequest();
			var spy = sinon.spy();
			xhr.onCreate = spy;

			protocol('file:');
			madkudu.send('/track', { userId: 'id' });

			sinon.assert.calledOnce(spy);
			var req = spy.getCall(0).args[0];
			assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track');
		});

		it('should use https: protocol when chrome-extension:', function () {
			var xhr = sinon.useFakeXMLHttpRequest();
			var spy = sinon.spy();
			xhr.onCreate = spy;

			protocol('chrome-extension:');
			madkudu.send('/track', { userId: 'id' });

			sinon.assert.calledOnce(spy);
			var req = spy.getCall(0).args[0];
			assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track');
		});

		it('should send to `api.madkudu.com/v1` by default', function () {
			var xhr = sinon.useFakeXMLHttpRequest();
			var spy = sinon.spy();
			xhr.onCreate = spy;

			protocol('https:');
			madkudu.send('/track', { userId: 'id' });

			sinon.assert.calledOnce(spy);
			var req = spy.getCall(0).args[0];
			assert.strictEqual(req.url, 'https://api.madkudu.com/v1/track');
		});

		it('should send a normalized payload', function () {
			var xhr = sinon.useFakeXMLHttpRequest();
			var spy = sinon.spy();
			xhr.onCreate = spy;

			var payload = {
				key1: 'value1',
				key2: 'value2'
			};

			madkudu.normalize = function () { return payload; };

			madkudu.send('/track', {});

			sinon.assert.calledOnce(spy);
			var req = spy.getCall(0).args[0];
			assert.strictEqual(req.requestBody, JSON.stringify(payload));
		});

		describe('beacon', function () {
			beforeEach(function () {
				navigator.sendBeacon = sinon.stub().returns(true);
			});

			it('should default to ajax', function () {
				var beacon = navigator.sendBeacon;

				var ajax = sinon.spy();
				var xhr = sinon.useFakeXMLHttpRequest();
				xhr.onCreate = ajax;

				madkudu.send('/track', { userId: 'id' });

				assert(!beacon.called);
				assert(ajax.calledOnce);
			});

			it('should call beacon', function () {
				var beacon = navigator.sendBeacon;

				madkudu.options.beacon = true;

				madkudu.send('/track', { userId: 'id' });

				sinon.assert.calledOnce(beacon);
				var args = beacon.getCall(0).args;
				assert.strictEqual(args[0], 'https://api.madkudu.com/v1/track');
				assert(typeof args[1] === 'string');
			});

			it('should not fallback to ajax on beacon success', function () {
				var beacon = navigator.sendBeacon;

				var ajax = sinon.spy();
				var xhr = sinon.useFakeXMLHttpRequest();
				xhr.onCreate = ajax;

				madkudu.options.beacon = true;

				madkudu.send('/track', { userId: 'id' });

				sinon.assert.calledOnce(beacon);
				sinon.assert.notCalled(ajax);
			});

			it('should fallback to ajax on beacon failure', function () {
				navigator.sendBeacon = sinon.stub().returns(false);
				var beacon = navigator.sendBeacon;

				var ajax = sinon.spy();
				var xhr = sinon.useFakeXMLHttpRequest();
				xhr.onCreate = ajax;

				madkudu.options.beacon = true;

				madkudu.send('/track', { userId: 'id' });

				sinon.assert.calledOnce(beacon);
				sinon.assert.calledOnce(ajax);
			});

			it('should fallback to ajax if beacon is not supported', function () {
				navigator.sendBeacon = null;

				var ajax = sinon.spy();
				var xhr = sinon.useFakeXMLHttpRequest();
				xhr.onCreate = ajax;

				madkudu.options.beacon = true;

				madkudu.send('/track', { userId: 'id' });

				sinon.assert.calledOnce(ajax);
			});

			it('should execute callback with no arguments', function (done) {
				var beacon = navigator.sendBeacon;

				var ajax = sinon.spy();
				var xhr = sinon.useFakeXMLHttpRequest();
				xhr.onCreate = ajax;

				madkudu.options.beacon = true;

				madkudu.send('/track', { userId: 'id' }, function (error, res) {
					assert(!error);
					assert(!res);
					assert(beacon.calledOnce);
					assert(!ajax.called);
					done();
				});
			});
		});

		it('should call the callback after sending', function (done) {

			var response = JSON.stringify({ text: 'mock' });

			madkudu._send_json = function (url, data, headers, fn) {
				var req = { response: response };
				fn(null, req);
			};

			var callback = sinon.spy();

			madkudu.send('/track', { email: 'a' }, callback);

			tick(function () {
				var args = callback.args[0];
				assert(args[0] === null);
				expect(args[1]).to.have.a.property('response', response);
				expect(args[1]).to.have.a.property('url');
				done();
			});

		});

		it('should callback with error if error in the request', function (done) {

			madkudu._send_json = function (url, data, headers, fn) {
				fn(new Error('bad request'));
			};

			var callback = sinon.spy();

			madkudu.send('/track', { email: 'a' }, callback);

			tick(function () {
				var args = callback.args[0];
				assert(args[0] instanceof Error);
				done();
			});

		});

	});


	describe('#request', function () {

		describe('fakeXhr', function () {

			it('should make an ajax request', function () {

				var ajax = sinon.spy();
				var xhr = sinon.useFakeXMLHttpRequest();
				xhr.onCreate = ajax;

				madkudu.request('/predict', { email: 'a' });

				sinon.assert.calledOnce(ajax);
			});

			after(function () {
				sinon.useFakeXMLHttpRequest().restore();
			});

		});

		describe('mock send', function () {

			it('should return the parsed response in the callback', function (done) {

				var response = { text: 'mock' };

				madkudu._send_json = function (url, data, headers, fn) {
					var req = { response: JSON.stringify(response) };
					fn(null, req);
				};

				var callback = sinon.spy();

				madkudu.request('/predict', { email: 'a' }, callback);

				tick(function () {
					sinon.assert.calledWith(callback, null, response);
					done();
				});

			});

			it('should callback with error if unparseable json', function (done) {

				var response = { text: 'mock' };

				madkudu._send_json = function (url, data, headers, fn) {
					var req = { response: response };
					fn(null, req);
				};

				var callback = sinon.spy();

				madkudu.request('/predict', { email: 'a' }, callback);

				tick(function () {
					var args = callback.args[0];
					assert(args[0] instanceof Error);
					done();
				});

			});

			it('should callback with error if error in the request', function (done) {

				madkudu._send_json = function (url, data, headers, fn) {
					fn(new Error('bad request'));
				};

				var callback = sinon.spy();

				madkudu.request('/predict', { email: 'a' }, callback);

				tick(function () {
					var args = callback.args[0];
					assert(args[0] instanceof Error);
					done();
				});

			});

		});

	});

	describe('#predict', function () {

		beforeEach(function () {
			sinon.stub(madkudu, 'request');
		});

		it('should call request with route and data', function () {
			var data = {};
			madkudu.predict(data);
			sinon.assert.calledWith(madkudu.request, '/predict', data, undefined);
		});

		it('should call request with callback', function () {
			var data = {};
			var fn = sinon.spy();
			madkudu.predict(data, fn);
			sinon.assert.calledWith(madkudu.request, '/predict', data, fn);
		});
	});

	describe('#smart_form', function () {

		it('should not call smart_form on initialize if not active', function () {
			madkudu = new MadKudu();
			sinon.stub(madkudu, 'smart_form');

			var settings = {
				form: {
					active: false
				}
			};

			madkudu.initialize(settings);

			sinon.assert.notCalled(madkudu.smart_form);
		});

		it('should call smart_form on initialize if active', function () {
			madkudu = new MadKudu();
			sinon.stub(madkudu, 'smart_form');

			var settings = {
				form: {
					active: true
				}
			};
			madkudu.initialize(settings);

			sinon.assert.calledOnce(madkudu.smart_form);
		});

		it('should call initialize on each form', function () {
			var init = sinon.spy();
			madkudu.forms = [{ init: init }, { init: init }];
			madkudu.smart_form();
			sinon.assert.calledTwice(init);
		});

	});

	describe('#_init_form', function () {

		it('should add a form to the array and not return an error', function () {
			sinon.stub(madkudu, 'debug');
			madkudu._init_form({ name: 'a' });
			sinon.assert.notCalled(madkudu.debug);
			assert(madkudu.forms.length === 1);
		});

		// it('should not add the form and call debug if incomplete settings', function () {
		// 	sinon.stub(madkudu, 'debug');
		// 	madkudu._init_form();
		// 	sinon.assert.calledOnce(madkudu.debug);
		// 	expect(madkudu.forms).to.deep.equal([]);
		// });

	});

	describe('#_init_forms', function () {

		it('should start with an empty forms array', function () {
			expect(madkudu.forms).to.deep.equal([]);
		});

		it('should not call init_form if no campaigns defined', function () {

			sinon.stub(madkudu, '_init_form');

			madkudu.settings = {
				api_key: 'api_key',
				form: {
					active: false,
					has_campaigns: false,
					campaigns: []
				}
			};

			madkudu._init_forms();

			sinon.assert.notCalled(madkudu._init_form);
		});

		it('should not call init_form for each campaign', function () {

			sinon.stub(madkudu, '_init_form');

			madkudu.settings = {
				api_key: 'api_key',
				form: {
					active: false,
					has_campaigns: false,
					campaigns: [ { name: 'a' }, { name: 'b' } ]
				}
			};

			madkudu._init_forms();

			sinon.assert.calledTwice(madkudu._init_form);
		});

	});

});
