'use strict';

module.exports = function (options, settings) {

};

// var es = require('event-stream');
// var gutil = require('gulp-util');
// var ejs = require('ejs');

// module.exports = function (options, settings) {
//     return es.map(function (file, cb) {
//         try {
//             settings = settings || {};
//             if(!settings.ext) settings.ext = '.html';

//             options.filename = file.path

//             file.contents = new Buffer(ejs.render(file.contents.toString(), options));
//             file.path = gutil.replaceExtension(file.path, settings.ext);
//             cb(null, file);
//         } catch (err) {
//             return cb(new Error('gulp-ejs: ' + err));
//         }
//     });
// };
