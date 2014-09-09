'use strict';

var es = require('event-stream');
var knox = require('knox');
var gutil = require('gulp-util');
var mime = require('mime');
mime.defaultType = 'text/plain';

module.exports = function (aws, options, directories) {
  options = options || {};
  directories = directories || [];

  if (!options.delay) { options.delay = 0; }

  var client = knox.createClient(aws);
  var regexGzip = /\.([a-z]{2,})\.gz$/i;
  var regexGeneral = /\.([a-z]{2,})$/i;
  var i, rootIndex, rootPath;

  return es.mapSync(function (file) {

      // Verify this is a file
      if (!file.isBuffer()) { return file; }

      if(directories.length) {
        // Get the root path based on provided directories
        rootPath = file.path.split('/');
        for(i = 0; i < directories.length; i++) {
          rootIndex = rootPath.indexOf(directories[i]);
          if(rootIndex > -1) {
            rootPath = rootPath.splice(0, rootIndex);
            rootPath = rootPath.join('/');
            break;
          }
        }

        // Trim the trailing '/', if present and if it is the last char of string
        if(options.uploadPath.lastIndexOf('/') === options.uploadPath.length - 1){
          options.uploadPath = options.uploadPath
            .substring(0, options.uploadPath.length - 1);
        }
      } else {
        rootPath = file.base;
      }

      var uploadPath = file.path.replace(rootPath, options.uploadPath || '');
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
          return file;
      }

      // Set content type based of file extension
      if (!headers['Content-Type'] && regexGeneral.test(uploadPath)) {
        headers['Content-Type'] = mime.lookup(uploadPath);
        if (options.encoding) {
          headers['Content-Type'] += '; charset=' + options.encoding;
        }
      }

      headers['Content-Length'] = file.stat.size;

      client.putBuffer(file.contents, uploadPath, headers, function(err, res) {
        if (err || res.statusCode !== 200) {
          gutil.log(gutil.colors.red('[FAILED]', file.path + ' -> ' + uploadPath));
        } else {
          gutil.log(gutil.colors.green('[SUCCESS]', file.path + ' -> ' + uploadPath));
          res.resume();
        }
      });

      return file;
  });
};
