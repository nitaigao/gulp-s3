'use strict';

// module.exports = function (options, settings) {

// };

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


// var gulp = require('gulp');
// var knox = require('knox');
// var es = require('event-stream');
// var fs = require('fs');

// module.exports = function (options) {
//     return es.map(function (file, cb) {
//         var uploadPath = file.path.replace(file.base, '/');
//         var opts = options || {}
//         var client = knox.createClient(opts);

//         var isDirectory = fs.lstatSync(file.path).isDirectory()

//         if (!isDirectory) {
//             console.log(file.path);
//             var req = client.put(file.path, {
//                 'Content-Length': buf.length,
//                 'Content-Type': 'text/plain'
//             });

//             req.on('response', function(res) {
//                 if (200 == res.statusCode) {
//                     console.log('saved to %s', req.url);
//                 }
//             });

//             req.end(buf);
//         }

//         // if (!isDirectory) {
//         //  client.putFile(file.path, uploadPath, function(err, res){
//         //      if (err) {
//         //          console.log(err);
//         //      }
//         //      res.resume();
//         //  //  // console.log(res);

//         //  //          // Always either do something with `res` or at least call `res.resume()`.
//         //  });
//         // }
//     });
// };
