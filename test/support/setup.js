'use strict';

require('object.observe');

// record the changes to the window object
global.mk_window_changes = {};

Object.observe(global.window, changes => {
	for (let i = 0; i < changes.length; i++) {
		const value = changes[i];
		global.mk_window_changes[value.name] = value.type;
	}
});
