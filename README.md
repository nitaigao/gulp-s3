# gulp-s3 [![NPM version][npm-image]][npm-url]

> s3 plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-s3` as a development dependency:

```shell
npm install --save-dev gulp-s3
```

Setup your aws.json file
```javascript
{
  "key": "AKIAI3Z7CUAFHG53DMJA",
  "secret": "acYxWRu5RRa6CwzQuhdXEfTpbQA+1XQJ7Z1bGTCx",
  "bucket": "dev.example.com",
  "region": "eu-west-1"
}
```

Then, use it in your `gulpfile.js`:
```javascript
var s3 = require("gulp-s3");

aws = JSON.parse(fs.readFileSync('./aws.json'));
gulp.src('./dist/**')
    .pipe(s3(aws));
```

## API


#### options.headers

Type: `Array`          
Default: `[]`

Headers to set to each file uploaded to S3

```javascript
var options = { headers: ['Cache-Control': 'max-age=315360000, no-transform, public'] }
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

});
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-s3
[npm-image]: https://badge.fury.io/js/gulp-s3.png
