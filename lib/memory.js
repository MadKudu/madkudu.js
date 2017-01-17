'use strict';

/*
 * Module Dependencies.
 */

const bindAll = require('bind-all');
const clone = require('@ndhoule/clone');

/**
 * HOP.
 */

const has = Object.prototype.hasOwnProperty;

/**
 * Expose `Memory`
 */

module.exports = bindAll(new Memory());

/**
 * Initialize `Memory` store
 */

function Memory () {
	this.store = {};
}

/**
 * Set a `key` and `value`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Boolean}
 */

Memory.prototype.set = function (key, value) {
	this.store[key] = clone(value);
	return true;
};

/**
 * Get a `key`.
 *
 * @param {String} key
 */

Memory.prototype.get = function (key) {
	if (!has.call(this.store, key)) {return;}
	return clone(this.store[key]);
};

/**
 * Remove a `key`.
 *
 * @param {String} key
 * @return {Boolean}
 */

Memory.prototype.remove = function (key) {
	delete this.store[key];
	return true;
};