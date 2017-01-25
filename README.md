# gulp-s3 [![NPM version][npm-image]][npm-url]

> s3 plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-s3` as a development dependency:

```shell
npm install --save-dev gulp-s3
```


Then, use it in your `gulpfile.js`:
```javascript
var s3   = require('gulp-s3')
var gulp = require('gulp')

var AWS = {
  "key":    process.env.AWS_ACCESS_KEY_ID,
  "secret": process.env.AWS_SECRET_ACCESS_KEY,
  "bucket": "dev.example.com",
  "region": "eu-west-1"
}

gulp.task('default', () => {
  gulp.src('./dist/**').pipe(s3(AWS));
});
```

## API

#### options.uploadPath

Type: `String`          
Default: ``

Set the remote folder on the S3 bucket

```javascript
var options = { uploadPath: 'remote-folder' } // It will upload the 'src' into '/remote-folder'
gulp.src('./dist/**', {read: false})
    .pipe(s3(aws, options));
```

#### options.headers

Type: `Array`          
Default: `[]`

Headers to set to each file uploaded to S3

```javascript
var options = { headers: {'Cache-Control': 'max-age=315360000, no-transform, public'} }
gulp.src('./dist/**', {read: false})
    .pipe(s3(aws, options));
```

#### options.gzippedOnly

Type: `Boolean`          
Default: `false`

Only upload files with .gz extension, additionally it will remove the .gz suffix on destination filename and set appropriate Content-Type and Content-Encoding headers.

```javascript
var gulp = require("gulp");
var s3 = require("gulp-s3");
var gzip = require("gulp-gzip");
var options = { gzippedOnly: true };

gulp.src('./dist/**')
  .pipe(gzip())
  .pipe(s3(aws, options));
```

#### options.uploadPath

Type: `String`          
Default: `''`

Put files in the specified directory. For example, `assets/` will upload files to `{BUCKET_NAME}.s3.amazonaws.com/assets/{FILE}`. This can also be used to prefix file names if a trailing slash is not given.

```javascript
var gulp = require("gulp");
var s3 = require("gulp-s3");
var options = { uploadPath: 'assets/' };

gulp.src('./dist/**')
  .pipe(s3(aws, options));
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-s3
[npm-image]: https://badge.fury.io/js/gulp-s3.png
