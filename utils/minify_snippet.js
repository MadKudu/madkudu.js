//
// const uglify = require('uglify-js');
// const fs = require('fs');
//
// const src = './lib/snippet.js';
// const dist = './dist/snippet.js';
// const dist_min = './dist/snippet.min.js';
// const dist_html = './dist/snippet.html';
//
// const copy = function () {
//  fs.writeFileSync(dist, fs.readFileSync(src, 'utf8'));
// };
//
// const minify = function () {
//  const minified = uglify.minify(src);
//  // console.log(minified);
//  fs.writeFileSync(dist_min, minified.code);
// };
//
// function html_escape (str) {
//  return str
//         .replace(/&/g, '&amp;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#39;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;');
// }
//
// const html_encode = function () {
//  var string = '<script type="text/javascript">\n';
//  string += fs.readFileSync(dist_min, 'utf8');
//  string += '</script>';
//  string = html_escape(string);
//  fs.writeFileSync(dist_html, string);
// };
//
// // copy();
// // minify();
// html_encode();
