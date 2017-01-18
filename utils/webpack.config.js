'use strict';

const babel_settings = {
	'presets': ['es2015'],
	'env': {
		'test': {
			'plugins': [ 'istanbul' ]
		}
	}
};

module.exports = {
	resolveLoader: {
		modulesDirectories: ['utils', 'node_modules']
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules(?!(\/@madkudu\/madkudu\.js))/, // exclude all node_modules, except @madkudu/madkudu.js (the exclusion is necessary for this to work inside another project)
				loader: 'babel-loader',
				query: babel_settings
			},
			{
				test: require.resolve('json3'),
				loader: 'imports-loader?define=>false'
			} // without this, loading json3 modifies window.JSON (see https://github.com/webpack/docs/wiki/shimming-modules#disable-some-module-styles)
		],
		noParse: [
			require('path').join(__dirname, 'node_modules', 'jquery'),
			require('path').join(__dirname, 'node_modules', 'next-tick') // if we parse nextTick, webpack adds a bunch of polyfills (setImmediate) that modify the window object. not cool.
		]
	},
	devtool: 'cheap-source-map',
	output: {
		library: 'madkudu',
		libraryTarget: 'umd'
	},
	plugins: []
};