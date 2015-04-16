'use strict';

var es = require('event-stream');
var knox = require('knox');
var gutil = require('gulp-util');
var mime = require('mime');
mime.default_type = 'text/plain';

var TIMEOUT = 5 * 60 * 1000;
var RETRY_TIMEOUT = 30 * 1000;

module.exports = function (aws, options) {
  options = options || {};

  var client = knox.createClient(aws);
  var regexGzip = /\.([a-z]{2,})\.gz$/i;
  var regexGeneral = /\.([a-z]{2,})$/i;

  return es.map(function (file, callback) {
      // Verify this is a file
      if (!file.isBuffer()) {
        return callback(null);
      }
      var timeout;
      var filePathDisplay = file.path.split(process.cwd())[1];

      function cb (obj) {
        if (obj === null) {
          clearTimeout(timeout);
        }
        callback(obj);
      }

      function bigError() {
        cb(new Error('gulp-s3 has failed on file ' + filePathDisplay));
      }

      function createTimeout() {
        timeout = setTimeout(bigError, TIMEOUT);
      }

      var uploadPath = file.path.replace(file.base, options.uploadPath || '');
      uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');
      var headers = { 'x-amz-acl': 'public-read' };
      if (options.headers) {
          for (var key in options.headers) {
              headers[key] = options.headers[key];
          }
      }

      if (regexGzip.test(file.path)) {
          // Set proper encoding for gzipped files, remove .gz suffix
          headers['Content-Encoding'] = 'gzip';
          uploadPath = uploadPath.substring(0, uploadPath.length - 3);
      } else if (options.gzippedOnly) {
          // Ignore non-gzipped files
          return callback(null);
      }

      // Set content type based of file extension
      if (!headers['Content-Type'] && regexGeneral.test(uploadPath)) {
        headers['Content-Type'] = mime.lookup(uploadPath);
        if (options.encoding) {
          headers['Content-Type'] += '; charset=' + options.encoding;
        }
      }

      headers['Content-Length'] = file.stat.size;

      var retries = 0;

      var retryTimeout;

      function doPut() {
        clearTimeout(retryTimeout);
        if (uploadSuccess) {
          return;
        }
        retryTimeout = setTimeout(doPut, RETRY_TIMEOUT);
        createTimeout();
        client.putBuffer(file.contents, uploadPath, headers, onPut);
      }

      function retry() {
        clearTimeout(retryTimeout);
        if (options.retries && retries < options.retries) {
          retries++;
          gutil.log(gutil.colors.yellow('[RETRYING ' + retries + ']', filePathDisplay));
          doPut();
        } else {
          gutil.log(gutil.colors.red('[MAX RETRIES]', filePathDisplay));
          bigError();
        }
      }

      var uploadSuccess = false;

      function onPut (err, res) {
        clearTimeout(timeout);
        if (err || res.statusCode !== 200) {
          gutil.log(gutil.colors.red('[FAILED]', filePathDisplay));
          retry();
        } else {
          if (!uploadSuccess) {
            clearTimeout(retryTimeout);
            gutil.log(gutil.colors.green('[SUCESS]', filePathDisplay));
            res.resume();
            cb(null);
          }
          uploadSuccess = true;
        }
      }

      gutil.log(gutil.colors.blue('[UPLOADING]', filePathDisplay));
      doPut();
  });
};
