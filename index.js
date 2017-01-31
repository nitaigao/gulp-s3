'use strict'
var async   = require('async')
var _       = require('lodash')
var AWS     = require('aws-sdk')
var s3      = new AWS.S3()

module.exports = function (aws, options) {
  options = options || {
    limit: 10
  }

  var stream = new require('stream').Writable()

  function cleanup(jobs, cb) {
    console.log("Scanning items to cleanup...")
    var LIST_PARAMS = { Bucket: aws.bucket }
    s3.listObjects(LIST_PARAMS, function(err, data) {
      
      if (err) console.log(err, err.stack)
      var results =_.differenceWith(data.Contents, jobs, function(a, b) {
        return (a.Key == b.key)
      })
      
      var deletables = results.map(function (result) { return { Key: result.Key }})
      if (deletables.length > 0) {
        console.log("Found", deletables.length, "items to cleanup")
        var DELETE_PARAMS = { Bucket: aws.bucket, Delete: { Objects: deletables } }
        s3.deleteObjects(DELETE_PARAMS, function(err, data) {
          if (err) console.log(err, err.stack)
          console.log("Cleaned up", deletables.length, "items")
          cb()
        })  
      } else {
        console.log("Nothing to cleanup, skipping")
        cb()
      }
    })
  }

  function upload(jobs, cb) {
    console.log("Starting upload of", jobs.length, "items")
    async.eachLimit(jobs, options.limit, function(job, done) {
      var params = { Bucket: aws.bucket, Key: job.key }
      s3.putObject(params, function(err, data) {
        if (err) console.log(err)
        console.log(job.key)
        done(err)
      })
    }, function(err) {
      console.log("Finished uploading", jobs.length, "items")
      cb(err)
    })
  }

  var jobs = []

  stream.write = function(file) {
    if (!file.isBuffer()) return

    var key = file.path
      .replace(file.base, options.uploadPath || '')
      .replace(new RegExp('\\\\', 'g'), '/')

    jobs.push({
      key: key,
      file: file
    })
  }

  stream.end = function() {
    upload(jobs, function() {
      cleanup(jobs, function() {
        stream.emit('end')
      })
    })
  }

  return stream
}