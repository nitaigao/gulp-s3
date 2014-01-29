# gulp-s3 [![NPM version][npm-image]][npm-url]

> s3 plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-s3` as a development dependency:

```shell
npm install --save-dev gulp-s3
```

Then, add it to your `gulpfile.js`:

```javascript
var s3 = require("gulp-s3");

options = JSON.parse(fs.readFileSync('./aws.json'));
gulp.src('./dist/**', {read: false})
    .pipe(s3(options))
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-s3
[npm-image]: https://badge.fury.io/js/gulp-s3.png
