'use strict';

var fs = require('fs');
var knox = require('knox');

module.exports = function (options) {
    return es.map(function (file, cb) {

        var isFile = fs.lstatSync(file.path).isFile();

        if (!isFile) {
            return false;
        }

        var stream = fs.createReadStream(file.path);
        var client = knox.createClient(options);

        var headers = {
          'Content-Length': file.size,
          'Content-Type': file.type
        };

        var uploadPath = file.path.replace(file.base, '');
        client.putStream(stream, uploadPath, headers, function(err, res) {
            console.log(err);
          // error or successful upload
        });
    });
};

// var es = require('event-stream');
// var AWS = require('aws-sdk');
// var fs = require('fs');

// module.exports = function (options) {
//      return es.map(function (file, cb) {

//          var isFile = fs.lstatSync(file.path).isFile();

//          if (!isFile) {
//              return false;
//          }

//         var uploadPath = file.path.replace(file.base, '');
//         var opts = options || {};

//         AWS.config.update({
//          accessKeyId: options.key,
//          secretAccessKey: options.secret
//      });

//         var ep = new AWS.Endpoint('s3-eu-west-1.amazonaws.com');
//      var s3 = new AWS.S3({endpoint: ep});
//      var body = fs.readFileSync(file.path);

//      var params = {
//          Bucket: options.bucket,
//          Key: uploadPath,
//             Body: body
//      }

//      console.log(params);

//      s3.putObject(params, function (err, res) {
//             if (err) {
//                 console.log("Error uploading data: ", err);
//             }
//         });

//      console.log(uploadPath);
//      });
// };

