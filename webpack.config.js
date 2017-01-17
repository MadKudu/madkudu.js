'use strict';

const fs = require('fs');
const babel_settings = JSON.parse(fs.readFileSync('./.babelrc', { encoding: 'utf-8' }));
// read the babel config from the file instead of relying on .babelrc, to make sure it works when used as a module
// (since I'm not sure what happens when there's also a .babelrc in the requiring project)

module.exports = {
	resolveLoader: {
		modulesDirectories: ['utils', 'node_modules']
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
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
