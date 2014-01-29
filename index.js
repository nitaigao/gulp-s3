'use strict';

var es = require('event-stream');
var fs = require('fs');
var knox = require('knox');

module.exports = function (options) {
  var client = knox.createClient(options);
  var waitTime = 0;
  return es.mapSync(function (file, cb) {
      var isFile = fs.lstatSync(file.path).isFile();
      if (!isFile) { return false; }

      var uploadPath = file.path.replace(file.base, '');
      var headers = { 'x-amz-acl': 'public-read' };

      setTimeout(function() {
        client.putFile(file.path, uploadPath, headers, function(err, res) {
            if (err || res.statusCode !== 200) {
                console.log("Error uploading " + file.path);
            } else {
                console.log("Uploaded " + file.path);
                res.resume();
            }

        });
      }, waitTime);

      waitTime += 50;
  });
};
