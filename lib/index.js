
/**
 * madkudu.js
 *
 * (C) 2016 MadKudu Inc.
 */

/* eslint-disable no-undef */
var settings = __SETTINGS__
/* eslint-enable no-undef */

const MadKudu = require('./madkudu')

const madkudu = new MadKudu()
madkudu.VERSION = '1.3.1'

/**
 * Expose the `madkudu` singleton.
 */

module.exports = madkudu

// MadKudu specific part

const mdkd = window.madkudu || []

/**
 * Initialize.
 */

madkudu.initialize(settings)

/**
 * Before swapping the global, replay an existing global `madkudu` queue.
 */

/* eslint-disable no-unmodified-loop-condition */
while (mdkd && mdkd.length > 0) {
  const args = mdkd.shift()
  const method = args.shift()
  if (madkudu[method]) {
    madkudu[method].apply(madkudu, args)
  }
}
/* eslint-enable no-unmodified-loop-condition */

/**
 * Finally, replace the global queue with the real `madkudu` singleton.
 */

window.madkudu = madkudu
