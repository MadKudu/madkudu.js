/* eslint-disable */
!function(e,t){var r=e.madkudu=e.madkudu||[];if(!r.initialize)if(r.invoked)e.console&&console.error&&console.error("MadKudu snippet included twice.");
else{r.invoked=!0,r.methods=["identify","reset","group","ready","page","track","once","on","smart_form"],r.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);
return t.unshift(e),r.push(t),r}};for(var o=0;o<r.methods.length;o++){var n=r.methods[o];
r[n]=r.factory(n)}r.load=function(r){var o=("https:"===t.location.protocol?"https://":"http://")+"cdn.madkudu.com/madkudu.js/v1/"+r+"/madkudu.min.js";
if("function"==typeof e.define&&e.define.amd)e.require([o]);else{var n=t.createElement("script");
n.type="text/javascript",n.async=!0,n.src=o;var a=t.getElementsByTagName("script")[0];
a.parentNode.insertBefore(n,a)}}}}(window,document);
madkudu.SNIPPET_VERSION = '0.4.0';
madkudu.load(__MADKUDU_API_KEY__);
madkudu.page();
/* eslint-enable */
