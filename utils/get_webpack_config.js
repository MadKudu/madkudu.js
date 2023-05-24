require('dotenv').config()
const _ = require('lodash')
const webpack = require('webpack')
const WEBPACK_CONFIG = require('./webpack.config')
const path = require('path')

const debug = require('debug')('compiler')

const SRC = './lib/index.js'

module.exports = function (settings = {}, options = {}) {
  const webpack_config = _.cloneDeep(WEBPACK_CONFIG)

  const injections = {
    __SETTINGS__: JSON.stringify(settings)
  }

  if (options.test) {
    webpack_config.output = {
      libraryTarget: 'var'
    }
    // if (!process.env.SAUCE_USERNAME) {
    //   throw new Error('A SAUCE_USERNAME is required')
    // } else if (!process.env.SAUCE_ACCESS_KEY) {
    //   throw new Error('A SAUCE_ACCESS_KEY is required')
    if (!process.env.SEGMENT_API_KEY) {
      throw new Error('A SEGMENT_API_KEY is required')
    } else if (!process.env.MADKUDU_API_KEY) {
      throw new Error('A MADKUDU_API_KEY is required')
    }
    injections.__SEGMENT_API_KEY__ = JSON.stringify(process.env.SEGMENT_API_KEY)
    injections.__MADKUDU_API_KEY__ = JSON.stringify(process.env.MADKUDU_API_KEY)
  } else {
    webpack_config.context = path.join(__dirname, '/..')
    webpack_config.entry = SRC
    webpack_config.output.filename = options.min ? options.filename.replace('.js', '.min.js') : options.filename
    webpack_config.output.path = path.resolve(__dirname, options.dist_path)
  }

  // inject the settings into the source
  webpack_config.plugins.push(new webpack.DefinePlugin(injections))

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
    )
  }

  // minimize if options.min
  if (options.min) {
    webpack_config.mode = 'production'
  }

  debug(webpack_config)
  return webpack_config
}
