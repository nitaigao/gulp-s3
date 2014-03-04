'use strict';

var es = require('event-stream');
var fs = require('fs');
var knox = require('knox');
var gutil = require('gulp-util');

module.exports = function (aws, options) {
  options = options || {};
  
  if (!options.delay) { options.delay = 0; }
  
  var client = knox.createClient(aws);
  var waitTime = 0;
  var regex = /\.([a-z]{2,4})\.gz$/i;

  return es.mapSync(function (file, cb) {
      var isFile = fs.lstatSync(file.path).isFile();

      // Verify this is a file and it doesn't matche our filter
      if (!isFile) { return false; }

      var uploadPath = file.path.replace(file.base, options.uploadPath || '');

      var headers = { 'x-amz-acl': 'public-read' };
      if (options.headers) {
          for (var key in options.headers) {
              headers[key] = options.headers[key];
          }
      }

      var matches;
      if (options.gzippedOnly && !/\.gz$/gi.test(file.path)) { 
        // If we have gzip enabled, ignore non-gzipped files
        return false; 
      } else if (options.gzippedOnly && (matches = regex.exec(file.path))) {
        // Handle uploading of gzipped files, set headers + rename extension

        var suffix = matches[1];
        var encoding = 'plain';
        
        switch (suffix) {
            case 'js':
                suffix = 'javascript';
                encoding = 'text';
                break;

            case 'css':
            case 'html': 
                encoding = 'text';
                break;        

            case 'jpg':
                encode = 'image';
                suffix = 'jpeg';
                break;

            case 'png':
            case 'bmp':
            case 'gif':
                encoding = 'image';
                break;

            default:
                suffix = 'text'; // If can't find a suitable encoding, set to text/plain
        }

        headers['Content-Encoding'] = 'gzip';
        headers['Content-Type'] = encoding + '/' + suffix;
        uploadPath = uploadPath.substring(0, uploadPath.length - 3);
      }

      setTimeout(function() {
        client.putFile(file.path, uploadPath, headers, function(err, res) {
            if (err || res.statusCode !== 200) {
                gutil.log(gutil.colors.red('[FAILED]', file.path + " -> " + uploadPath));
            } else {
                gutil.log(gutil.colors.green('[SUCCESS]', file.path + " -> " + uploadPath));
                res.resume();
            }
        });
      }, waitTime);

      waitTime += options.delay;
  });
};
