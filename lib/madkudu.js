'use strict';

const Emitter = require('component-emitter');
const is = require('is');
const nextTick = require('next-tick');
const cookie = require('./cookie');
const store = require('./store');
const user = require('./user');
const group = require('./group');
// const bindAll = require('bind-all');
const type = require('component-type');
const send = require('@segment/send-json');
const json = require('json3');
const uuid = require('uuid').v4;
const md5 = require('spark-md5').hash;
const Form = require('./form');
const defaults = require('@ndhoule/defaults');
const pageDefaults = require('./pageDefaults');

const debug = require('debug')('madkudu.js');
const noop = function () {};

/**
 * Initialize a new `MadKudu` instance.
 */

const MadKudu = function () {
	this._options();
	this._settings();
	this._readied = false;
	this._timeout = 300;
	this._user = user;
	this.forms = [];
	this.api_host = 'https://api.madkudu.com/v1';
	// bindAll(this);

	this.on('initialize', (settings, options) => {
		if (options.initialPageview) { this.page(); }
	});
};

/**
 * Mix in event emitter.
 */

Emitter(MadKudu.prototype);

/**
 * Set the `timeout` (in milliseconds) used for callbacks.
 *
 * @param {Number} timeout
 */

MadKudu.prototype.timeout = function (timeout) {
	this._timeout = timeout;
};

/**
 * Enable or disable debug.
 *
 * @param {object} obj
 */

MadKudu.prototype.debug = function (obj) {
	debug(obj);
};

/**
 * Apply options.
 *
 * @param {Object} options
 * @return {MadKudu}
 * @api private
 */

MadKudu.prototype._options = function (options) {
	options = options || {};
	this.options = options;
	cookie.options(options.cookie);
	store.options(options.localStorage);
	user.options(options.user);
	group.options(options.group);
	return this;
};

/**
 * Apply settings.
 *
 * @param {Object} settings
 * @return {MadKudu}
 * @api private
 */

MadKudu.prototype._settings = function (settings) {
	settings = settings || {};
	this.settings = settings;
	this.settings.form = settings.form || { active: false, forms: [] };
};

/**
 * Initialize with the given integration `settings` and `options`.
 *
 * Aliased to `init` for convenience.
 *
 * @param {Object} [settings={}]
 * @param {Object} [options={}]
 * @return {MadKudu}
 */

MadKudu.prototype.init = MadKudu.prototype.initialize = function (settings, options) {
	settings = settings || {};
	options = options || {};

	this._options(options);
	this._settings(settings);

	// make ready callback
	var ready = () => {
		this._readied = true;
		this.emit('ready');
	};

	if (!this.readied) {

		// load user now that options are set
		user.load();
		group.load();

		this._init_forms();

		if (this.settings.form.active) {
			this.smart_form();
		}

		ready();

		this.emit('initialize', settings, options);
	}
	return this;
};

/**
 * Set the user's `id`.
 *
 * @param {Mixed} id
 */

MadKudu.prototype.setAnonymousId = function (id) {
	this.user().anonymousId(id);
	return this;
};

/**
 * Register a `fn` to be fired when all the analytics services are ready.
 *
 * @param {Function} fn
 * @return {MadKudu}
 */

MadKudu.prototype.ready = function (fn) {
	if (is.fn(fn)) {
		if (this._readied) {
			nextTick(fn);
		} else {
			this.once('ready', fn);
		}
	}
	return this;
};

/**
 * Callback a `fn` after our defined timeout period.
 *
 * @param {Function} fn
 * @return {MadKudu}
 * @api private
 */

MadKudu.prototype._callback = function (fn) {
	if (is.fn(fn)) {
		this._timeout ? setTimeout(fn, this._timeout) : nextTick(fn);
	}
	return this;
};

/**
 * Return the current user.
 *
 * @return {Object}
 */

MadKudu.prototype.user = function () {
	return user;
};

/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {MadKudu}
 */

MadKudu.prototype.identify = function (id, traits, options, fn) {
	// Argument reshuffling.
	if (!arguments.length) {
		return user;
	}
	/* eslint-disable no-unused-expressions, no-sequences */
	if (is.fn(options)) {fn = options, options = null;}
	if (is.fn(traits)) {fn = traits, options = null, traits = null;}
	if (is.object(id)) {options = traits, traits = id, id = user.id();}
	/* eslint-enable no-unused-expressions, no-sequences */

	// clone traits before we manipulate so we don't do anything uncouth, and take
	// from `user` so that we carryover anonymous traits
	user.identify(id, traits);
	this._callback(fn);
	return this;
};

/**
 * Identify a group by optional `id` and `traits`. Or, if no arguments are
 * supplied, return the current group.
 *
 * @param {string} [id=group.id()] Group ID.
 * @param {Object} [traits=null] Group traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {MadKudu|Object}
 */

MadKudu.prototype.group = function (id, traits, options, fn) {
	// Argument reshuffling.
	/* eslint-disable no-unused-expressions, no-sequences */
	if (!arguments.length) {
		return group;
	}
	if (is.fn(options)) {fn = options, options = null;}
	if (is.fn(traits)) {fn = traits, options = null, traits = null;}
	if (is.object(id)) {options = traits, traits = id, id = user.id();}
	/* eslint-enable no-unused-expressions, no-sequences */

	// clone traits before we manipulate so we don't do anything uncouth, and take
	// from `user` so that we carryover anonymous traits
	user.group(id, traits);
	this._callback(fn);
	return this;
};

MadKudu.prototype.page = function (category, name, properties, options, fn) {
	// Argument reshuffling.
	/* eslint-disable no-unused-expressions, no-sequences */
	if (is.fn(options)) {fn = options, options = null;}
	if (is.fn(properties)) {fn = properties, options = properties = null;}
	if (is.fn(name)) {fn = name, options = properties = name = null;}
	if (type(category) === 'object') {options = name, properties = category, name = category = null;}
	if (type(name) === 'object') {options = properties, properties = name, name = null;}
	if (type(category) === 'string' && type(name) !== 'string') {name = category, category = null;}
	/* eslint-enable no-unused-expressions, no-sequences */
	this._callback(fn);
	return this;
};

/**
 * Reset group and user traits and id's.
 *
 * @api public
 */

MadKudu.prototype.reset = function () {
	this.user().logout();
	this.group().logout();
};

/**
 * Normalize the given `msg`.
 *
 * @api private
 * @param {Object} msg
 */

MadKudu.prototype.normalize = function (msg) {
	this.debug('normalize %o', msg);
	var user = this.user();
	// var global = exports.global;
	// var query = global.location.search;
	var ctx = msg.context = msg.context || msg.options || {};
	delete msg.options;
	msg.api_key = this.settings.api_key;
	ctx.userAgent = navigator.userAgent;
	if (!ctx.library) {ctx.library = { name: 'madkudu.js', version: this.VERSION };}
	ctx.page = defaults(ctx.page || {}, pageDefaults());
	// if (query) ctx.campaign = utm(query);
	// this.referrerId(query, ctx);
	msg.userId = msg.userId || user.id();
	msg.anonymousId = user.anonymousId();
	msg.sentAt = new Date();
	// add some randomness to the messageId checksum
	msg.messageId = 'mjs-' + md5(json.stringify(msg) + uuid());
	this.debug('normalized %o', msg);
	// this.ampId(ctx);
	return msg;
};

MadKudu.prototype._send_json = send;

/**
 * Send `data` to `route`.
 *
 * @api private
 * @param {string} route
 * @param {Object} data
 * @param {Function} fn
 */

MadKudu.prototype.send = function (route, data, fn) {
	var url = this.api_host + route;
	fn = fn || noop;

	var msg = this.normalize(data);

	var sendAjax = () => {
		// Beacons are sent as a text/plain POST
		var headers = { 'Content-Type': 'text/plain' };
		this._send_json(url, msg, headers, (err, res) => {
			this.debug('ajax sent %o, received %o', msg, arguments);
			if (err) {return fn(err);}
			res.url = url;
			fn(null, res);
		});
	};

	// send
	if (this.options.beacon && navigator.sendBeacon) {
		// Beacon returns false if the browser couldn't queue the data for transfer
		// (e.g: the data was too big)
		if (navigator.sendBeacon(url, json.stringify(msg))) {
			this.debug('beacon sent %o', msg);
			fn();
		} else {
			this.debug('beacon failed, falling back to ajax %o', msg);
			sendAjax();
		}
	} else {
		sendAjax();
	}
};

/**
 * post `data` to `route`.
 *
 * @api private
 * @param {string} route
 * @param {Object} data
 * @param {Function} fn
 */

MadKudu.prototype.request = function (route, data, fn) {
	var url = this.api_host + route;
	var headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + btoa(this.settings.api_key + ':')
	};
	this._send_json(url, data, headers, (err, res) => {
		if (err) {return fn(err);}
		try {
			var response = JSON.parse(res.response);
			fn(null, response);
		} catch (e) {
			return fn(e);
		}
	});
};

/**
 * post `data` to `route`.
 *
 * @api private
 * @param {string} route
 * @param {Object} data
 * @param {Function} fn
 */


MadKudu.prototype.predict = function (data, callback) {
	var route = '/predict';
	this.request(route, data, callback);
};

/**
 * send data to the track endpoint
 *
 * @api private
 * @param {string} event
 * @param {Object} props
 * @param {Object} context
 */

MadKudu.prototype.track = function (event, props, context) {
	var body = {
		event: event,
		properties: props,
		context: context || {},
		type: 'track'
	};
	this.send('/track', body);
};

/**
 * _init_form
 *
 * Instantiate a new smart form with the settings
 *
 * @api private
 */

MadKudu.prototype._init_form = function (campaign_settings) {
	try {
		var form = new Form(this, campaign_settings);
		form.init();
		this.forms.push(form);
	} catch (e) {
		// console.log(e);
		this.debug(e);
	}
};

/**
 * init_forms.
 *
 * Create a new smart_form object for each object
 *
 * @api private
 */

MadKudu.prototype._init_forms = function () {
	var campaigns = this.settings.form.campaigns || [];
	for (var i = 0; i < campaigns.length; i++) {
		var campaign_settings = campaigns[i];
		this._init_form(campaign_settings);
	}
};

/**
 * smart_form
 *
 * Start all instantiated campaigns
 *
 * @api private
 */

MadKudu.prototype._start_forms = function () {
	for (var i = 0; i < this.forms.length; i++) {
		this.forms[i].start();
	}
};

/**
 * smart_form
 *
 * Start all instantiated campaigns
 *
 * @api private
 */

MadKudu.prototype.smart_form = function () {
	$(document).ready(() => {
		this._start_forms();
	});
};

module.exports = MadKudu;
