'use strict';

/*
 * Module dependencies.
 */

const Entity = require('./entity');
const bindAll = require('bind-all');
const debug = require('debug')('analytics:user');
const inherit = require('inherits');
const uuid = require('uuid');
const is = require('is');
const nextTick = require('next-tick');

const noop = function () {};

/**
 * User defaults
 */

User.defaults = {
	persist: true,
	cookie: {
		key: 'mkjs_user_id',
		oldKey: 'mkjs_user'
	},
	localStorage: {
		key: 'mkjs_user_traits'
	}
};


/**
 * Initialize a new `User` with `options`.
 *
 * @param {Object} options
 */

function User (options) {
	this.defaults = User.defaults;
	this.debug = debug;
	Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(User, Entity);

/**
 * Set/get the user id.
 *
 * When the user id changes, the method will reset his anonymousId to a new one.
 *
 * @param {string} id
 * @return {Mixed}
 * @example
 */

User.prototype.id = function (id) {
	var prev = this._getId();
	var ret = Entity.prototype.id.apply(this, arguments);
	if (prev == null) {
		return ret;
	}
	if (prev !== id && id) {
		this.anonymousId(null);
	}
	return ret;
};

/**
 * Set / get / remove anonymousId.
 *
 * @param {String} anonymousId
 * @return {String|User}
 */

User.prototype.anonymousId = function (anonymousId) {
	var store = this.storage();

	// set / remove
	if (arguments.length) {
		store.set('mkjs_anonymous_id', anonymousId);
		return this;
	}

	// new
	anonymousId = store.get('mkjs_anonymous_id');
	if (anonymousId) {
		return anonymousId;
	}

	// empty
	anonymousId = uuid.v4();
	store.set('mkjs_anonymous_id', anonymousId);
	return store.get('mkjs_anonymous_id');
};

/**
 * Remove anonymous id on logout too.
 */

User.prototype.logout = function () {
	Entity.prototype.logout.call(this);
	this.anonymousId(null);
};

/**
 * Load saved user `id` or `traits` from storage.
 */

User.prototype.load = function () {
	Entity.prototype.load.call(this);
};

User.prototype._callback = function (fn) {
	if (is.fn(fn)) {
		this._timeout ? setTimeout(fn, this._timeout) : nextTick(fn);
	}
	return this;
};

User.prototype.predict = function (callback) {
	if (!is.fn(callback)) {
		callback = function () { };
	}
	var traits = this.traits();
	window.madkudu.predict(traits, callback);
	return this;
};

User.prototype.is_qualified = function () {
	return ['good', 'very good'].indexOf(this.traits().customer_fit_segment) > -1;
};

User.prototype.qualify = function (fn) {
	if (!is.fn(fn)) {
		fn = noop;
	}
	var traits = this.traits();
	window.madkudu.predict({ email: traits.email }, (err, res) => {
		if (err) {
			return fn(err);
		}
		res = res || {};
		var customer_fit_segment = res.customer_fit && res.customer_fit.segment ? res.customer_fit.segment : 'not enough information';
		var traits = {
			domain: res.domain,
			customer_fit_segment: customer_fit_segment,
			qualified: ['good', 'very good'].indexOf(customer_fit_segment) > -1,
			company: res.company || {},
			person: res.person || {}
		};
		this.identify(this.id(), traits);
		fn(null, traits);
	});
	return this;
};


/**
 * Expose the user singleton.
 */

module.exports = bindAll(new User());


/**
 * Expose the `User` constructor.
 */

module.exports.User = User;
