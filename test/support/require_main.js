before(function (done) {
	window.require(['./base/dist/madkudu.min.js'], function (madkudu) {
		window.madkudu = madkudu;
		done();
	});
});
