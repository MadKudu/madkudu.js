require('object.observe');

global.mk_window_changes = {};

Object.observe(global.window, changes => {
	for (let i = 0; i < changes.length; i++) {
		const value = changes[i];
		global.mk_window_changes[value.name] = 'modified';
	}
});
