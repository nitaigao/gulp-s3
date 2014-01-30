'use strict';

var es = require('event-stream');
var fs = require('fs');
var knox = require('knox');
var gutil = require('gulp-util');

module.exports = function (aws, options) {
  if (!options.delay) { options.delay = 0; }

  var client = knox.createClient(aws);
  var waitTime = 0;

  return es.mapSync(function (file, cb) {
      var isFile = fs.lstatSync(file.path).isFile();
      if (!isFile) { return false; }

      var uploadPath = file.path.replace(file.base, '');
      var headers = { 'x-amz-acl': 'public-read' };

      setTimeout(function() {
        client.putFile(file.path, uploadPath, headers, function(err, res) {
            if (err || res.statusCode !== 200) {
                gutil.log(gutil.colors.red('[FAILED]', file.path));
            } else {
                gutil.log(gutil.colors.green('[SUCCESS]', file.path));
                res.resume();
            }
        });
      }, waitTime);

      waitTime += options.delay;
  });
};
