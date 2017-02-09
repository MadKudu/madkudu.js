(function (window, document) {
  var madkudu = window.madkudu = window.madkudu || []
  if (!madkudu.initialize) {
    // prevent from loading twice
    if (madkudu.invoked) {
      window.console && console.error && console.error('MadKudu snippet included twice.')
    } else {
      // preload the methods
      madkudu.invoked = !0
      madkudu.methods = ['identify', 'reset', 'group', 'ready', 'page', 'track', 'once', 'on', 'smart_form']
      madkudu.factory = function (t) {
        return function () {
          var e = Array.prototype.slice.call(arguments)
          e.unshift(t)
          madkudu.push(e)
          return madkudu
        }
      }
      for (var t = 0; t < madkudu.methods.length; t++) {
        var e = madkudu.methods[t]
        madkudu[e] = madkudu.factory(e)
      }
      // console.log(src);
      madkudu.load = function (api_key) {
        var src = (document.location.protocol === 'https:' ? 'https://' : 'http://') + 'cdn.madkudu.com/madkudu.js/v1/' + api_key + '/madkudu.min.js'
        // if require is here, load with it
        if (typeof window.define === 'function' && window.define.amd) {
          window.require([src])
        // otherwise, add the script to the page
        } else {
          var e = document.createElement('script')
          e.type = 'text/javascript'
          e.async = !0
          e.src = src
          var n = document.getElementsByTagName('script')[0]
          n.parentNode.insertBefore(e, n)
        }
      }
    }
  }
})(window, document)
// madkudu.SNIPPET_VERSION = '0.3.0';
// madkudu.load('985ccd7664cec040468ba02ac8864151');
// madkudu.page();
