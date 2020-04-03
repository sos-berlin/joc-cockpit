const gulp = require('gulp');
const replace = require('gulp-replace');

function makeid() {
    let date = new Date();
    return date.getTime();
}

gulp.task('default', () => {
    return gulp.src('src/index.html')
        .pipe(replace(/(.*)\.css\?(_v=\d+)*(.*)/g, '$1.css?_v='+makeid()+'$3'))
        .pipe(replace(/(.*)\.js\?(_v=\d+)*(.*)/g, '$1.js?_v='+makeid()+'$3'))
        .pipe(gulp.dest('src'));
});





