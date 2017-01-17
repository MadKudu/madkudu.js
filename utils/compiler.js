'use strict';

const webpack = require('webpack');
const Q = require('q');
const _ = require('lodash');
const debug = require('debug')('compiler');
const fs = require('fs');

const WEBPACK_CONFIG = require('../webpack.config');

const FILENAME = 'madkudu.js';
// const DIST_PATH = this.tenant ? './dist/' + this.tenant : './dist';
const DIST_PATH = './dist';
const SRC = './lib/index.js';
const JSON_INDENT = 4;


const Compiler = function (settings, options) {
	this.settings = settings || { api_key: 'test', form: { active: true, has_campaigns: true, campaigns: [] } };
	this.options = options || {};

	this.form = this.settings.form || {};

	this.options.dist_path = this.options.dist_path || DIST_PATH;
	this.options.output_path = this.options.dist_path + '/' + FILENAME;
	this.options.filename = this.options.filename || FILENAME;

	this.logger = this.options.logger || console;
};

Compiler.prototype.get_webpack_config = function (options) {
	options = options || {};

	const webpack_config = _.cloneDeep(WEBPACK_CONFIG);

	webpack_config.entry = SRC;
	webpack_config.output.filename = options.min ? this.options.filename.replace('.js', '.min.js') : this.options.filename;
	webpack_config.output.path = this.options.dist_path;

	webpack_config.plugins.push(
		new webpack.DefinePlugin({
			__CAMPAIGNS__: JSON.stringify(this.form.has_campaigns),
			__SETTINGS__: JSON.stringify(this.form.has_campaigns ? this.settings : {})
		})
	);
	if (options.min) {
		webpack_config.plugins.push(new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: !process.env.NODE_ENV === 'production' }
		}));
	}

	debug(webpack_config);
	return webpack_config;
};

Compiler.prototype._get_compiler = function (options) {
	const webpack_config = this.get_webpack_config(options);
	return webpack(webpack_config);
};

Compiler.prototype.compile = function (options) {
	options = options || {};
	const compiler = this._get_compiler(options);
	return Q.ninvoke(compiler, 'run')
		.then(stats => {
			console.log(stats.toString({ chunks: false, colors: true }));
			fs.writeFileSync(this.options.dist_path + '/webpack.json', JSON.stringify(stats.toJson({ reasons: true }), null, JSON_INDENT));
			this.logger.log('info', 'compiled madkudu.js', { options: options });
		});
};

Compiler.prototype.run = function (options) {
	options = options || {};
	let promise = this.compile();
	if (options.min) {
		promise = promise.then(() => this.compile({ min: true })); // if min is specified, also compiled to the minified format
	}
	return promise;
};

Compiler.prototype.watch = function (options) {
	const compiler = this._get_compiler(options);
	compiler.watch(null, (err, stats) => {
		if (err) {
			return console.error(err);
		}
		console.log(stats.toString({ chunks: false, colors: true }));
	});
};

module.exports = Compiler;
