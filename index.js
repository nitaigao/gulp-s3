'use strict';

var es = require('event-stream');
var fs = require('fs');
var knox = require('knox');
var gutil = require('gulp-util');
var mime = require('mime');
mime.default_type = 'text/plain';

module.exports = function (aws, options) {
  options = options || {};

  if (!options.delay) { options.delay = 0; }

  var client = knox.createClient(aws);
  var waitTime = 0;
  var regexGzip = /\.([a-z]{2,4})\.gz$/i;
  var regexGeneral = /\.([a-z]{2,4})$/i;

  return es.mapSync(function (file, cb) {

      // Verify this is a file
      if (!file.isBuffer()) { return false; }

      var uploadPath = file.path.replace(file.base, options.uploadPath || '');
      uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');
      var headers = { 'x-amz-acl': 'public-read' };
      if (options.headers) {
          for (var key in options.headers) {
              headers[key] = options.headers[key];
          }
      }

      if (options.gzippedOnly) {
        if (!regexGzip.test(file.path)) {
          // Ignore non-gzipped files
          return false;
        } else {
          // Set proper encoding for gzipped files, remove .gz suffix
          headers['Content-Encoding'] = 'gzip';
          uploadPath = uploadPath.substring(0, uploadPath.length - 3);
        }
      }

      // Set content type based of file extension
      if (regexGeneral.test(uploadPath)) {
        headers['Content-Type'] = mime.lookup(uploadPath);
      }

      headers['Content-Length'] = file.stat.size;

      client.putBuffer(file.contents, uploadPath, headers, function(err, res) {
        if (err || res.statusCode !== 200) {
          gutil.log(gutil.colors.red('[FAILED]', file.path + " -> " + uploadPath));
        } else {
          gutil.log(gutil.colors.green('[SUCCESS]', file.path + " -> " + uploadPath));
          res.resume();
        }
      });

  });
};
