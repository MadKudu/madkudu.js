const Entity = require('./entity')
const bindAll = require('bind-all')
const debug = require('debug')('analytics:group')
const inherit = require('inherits')

/**
 * Group defaults
 */

Group.defaults = {
  persist: true,
  cookie: {
    key: 'mkjs_group_id'
  },
  localStorage: {
    key: 'mkjs_group_properties'
  }
}

/**
 * Initialize a new `Group` with `options`.
 *
 * @param {Object} options
 */

function Group (options) {
  this.defaults = Group.defaults
  this.debug = debug
  Entity.call(this, options)
}

/**
 * Inherit `Entity`
 */

inherit(Group, Entity)

/**
 * Expose the group singleton.
 */

module.exports = bindAll(new Group())

/**
 * Expose the `Group` constructor.
 */

module.exports.Group = Group
