var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('server', function () {
  return gulp.src('').pipe(shell([ 'node-supervisor app.js' ]));
});