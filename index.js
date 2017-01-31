'use strict';

var es = require('event-stream');
var knox = require('knox');
var gutil = require('gulp-util');
var mime = require('mime');
mime.default_type = 'text/plain';

module.exports = function (aws, options) {
  options = options || {};

  var client = knox.createClient(aws);
  var waitTime = 0;
  var regexGzip = /\.([a-z]{2,})\.gz$/i;
  var regexGeneral = /\.([a-z]{2,})$/i;

  return es.map(function (file, finished) {
    if (!file.isBuffer()) { finished(null, file); return; }

    var uploadPath = file.path.replace(file.base, options.uploadPath || '');
    uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');
    
    var headers = { 'x-amz-acl': 'public-read' };

    if (options.headers) {
      for (var key in options.headers) {
        headers[key] = options.headers[key];
      }
    }

    if (regexGzip.test(file.path)) {
      headers['Content-Encoding'] = 'gzip';
      if (options.gzippedOnly) {
        uploadPath = uploadPath.substring(0, uploadPath.length - 3);
      }
    } else if (options.gzippedOnly) {
      return file;
    }

    // Set content type based on file extension
    if (!headers['Content-Type'] && regexGeneral.test(uploadPath)) {
      headers['Content-Type'] = mime.lookup(uploadPath);
      if (options.encoding) {
        headers['Content-Type'] += '; charset=' + options.encoding;
      }
    }

    var contentLength = 0;
    if(file.stat != null)
      contentLength = file.stat.size; // In case of a stream
    else
      contentLength = file.contents.length; // It may be a buffer

    headers['Content-Length'] = contentLength;

    client.putBuffer(file.contents, uploadPath, headers, function(err, res) {
      if (err || res && res.statusCode !== 200) {
        gutil.log(gutil.colors.red('[FAILED]', file.path + " -> " + uploadPath));

        if (err) {
          gutil.log(gutil.colors.red('  AWS ERROR:', err));
          throw new Error(err);
        } 
        
        if (res && res.statusCode !== 200){
          gutil.log(gutil.colors.red('  HTTP STATUS:', res.statusCode));
          throw new Error('HTTP Status Code: ' + res.statusCode);
        }

        finished(err, null)
      } else {
        gutil.log(gutil.colors.green('[SUCCESS]') + ' ' + gutil.colors.grey(file.path) + gutil.colors.green(" -> ") + uploadPath);
        res.resume();
        finished(null, file)
      }
    });
  });
};