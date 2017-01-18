const _ = require('lodash');
const webpack = require('webpack');
const WEBPACK_CONFIG = require('./webpack.config');

const debug = require('debug')('compiler');

const SRC = './lib/index.js';

module.exports = function (settings, options) {
	settings = settings || {};
	options = options || {};

	const webpack_config = _.cloneDeep(WEBPACK_CONFIG);

	if (options.test) {
		webpack_config.output = {
			libraryTarget: 'var'
		};
	} else {
		webpack_config.context = __dirname + '/..';
		webpack_config.entry = SRC;
		webpack_config.output.filename = options.min ? options.filename.replace('.js', '.min.js') : options.filename;
		webpack_config.output.path = options.dist_path;
	}

	// inject the settings into the source
	webpack_config.plugins.push(
		new webpack.DefinePlugin({
			__SETTINGS__: JSON.stringify(settings)
		})
	);

	// only add these dependencies if campaigns are activated
	if (settings.form && settings.form.campaigns && settings.form.campaigns.length > 0) {
		webpack_config.plugins.push(
			new webpack.ProvidePlugin({
				$: 'jquery/dist/jquery.slim',
				querystring: 'query-string',
				component_event: 'component-event',
				type: 'component-type',
				each: '@ndhoule/each',
				is: 'is',
				prevent: '@segment/prevent-default',
				isMeta: '@segment/is-meta'
			})
		);
	}

	// minimize if options.min
	if (options.min) {
		webpack_config.plugins.push(new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: !process.env.NODE_ENV === 'production' }
		}));
	}

	debug(webpack_config);
	return webpack_config;
};
