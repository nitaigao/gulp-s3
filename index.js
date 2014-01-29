'use strict';

var es = require('event-stream');
var fs = require('fs');
var knox = require('knox');

module.exports = function (options) {
    return es.map(function (file, cb) {
        var isFile = fs.lstatSync(file.path).isFile();

        if (!isFile) {
            return false;
        }

        var uploadPath = file.path.replace(file.base, '');
        var client = knox.createClient(options);

        var headers = {
            'x-amz-acl': 'public-read'
        };

        client.putFile(file.path, uploadPath, headers, function(err, res) {
            if (err || res.statusCode !== 200) {
                console.log("Error Uploading" + res.req.path);
            } else {
                console.log("Uploaded " + res.req.path);
            }
        });
    });
};
