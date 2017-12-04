const Q = require('q')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const DEFAULT_SETTINGS = require('./default_settings')
const get_webpack_config = require('./get_webpack_config')

const FILENAME = 'madkudu.js'
const DIST_PATH = path.resolve(__dirname, '../dist')
const JSON_INDENT = 4

class Compiler {
  constructor (settings = DEFAULT_SETTINGS, options = {}) {
    this.settings = settings
    this.options = options
    this.options.dist_path = this.options.dist_path || DIST_PATH
    this.options.output_path = this.options.dist_path + '/' + FILENAME
    this.options.filename = this.options.filename || FILENAME
    this.logger = this.options.logger || console
  }

  _get_compiler () {
    const webpack_config = get_webpack_config(this.settings, this.options)
    return webpack(webpack_config)
  }

  compile () {
    const compiler = this._get_compiler()
    return Q.ninvoke(compiler, 'run')
      .then(stats => {
        console.log(stats.toString({ chunks: false, colors: true }))
        const summary_path = path.resolve(this.options.dist_path, './webpack.json')
        fs.writeFileSync(`${summary_path}`, JSON.stringify(stats.toJson({ reasons: true }), null, JSON_INDENT))
        this.logger.log('info', 'compiled madkudu.js', { options: { min: !!this.options.min } })
      })
  }

  run (options = {}) {
    let promise = this.compile()
    if (options.min) { // if min is specified, also compiled to the minified format
      promise = promise.then(() => {
        this.options.min = true
        return this.compile()
      })
    }
    return promise
  }

  watch (options) {
    const compiler = this._get_compiler(options)
    compiler.watch(null, (err, stats) => {
      if (err) {
        return console.error(err)
      }
      console.log(stats.toString({ chunks: false, colors: true }))
    })
  }
}

module.exports = Compiler
