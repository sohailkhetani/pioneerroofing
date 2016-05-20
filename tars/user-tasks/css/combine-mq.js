'use strict';

const gulp = tars.packages.gulp;
const tarsConfig = tars.config;

const styleFolder = tars.options.build.path + tars.config.fs.staticFolderName + '/css/';
const styleFile = styleFolder + '/main.css';

/**
 *  Combine matching media queries into one media query definition.
 */

var combineMq = require('gulp-combine-mq');
module.exports = function () {
    return gulp.task('css:combineMq', function () {
        return gulp.src(styleFile)
        .pipe(combineMq({
            beautify: true
        }))
        .pipe(gulp.dest(styleFolder));
    });
};