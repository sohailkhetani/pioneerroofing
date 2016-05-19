'use strict';

const gulp = tars.packages.gulp;
const tarsConfig = tars.config;

/**
 * Remove unused CSS selectors.
 */

const styleFolder = tars.options.build.path + tars.config.fs.staticFolderName + '/css/';
const styleFile = styleFolder + '/main.css';

const uncss = require('gulp-uncss');
module.exports = function () {

    return gulp.task('css:uncss', function (cb) {
        return gulp.src([
          styleFile
        ])
        .pipe(
            uncss({
                html: [
                    tars.options.build.path + 'index.html'
                ],
                ignore : [
                    // '.sticky-wrapper',
                    // '.is-sticky',
                    // '.is-sticky .navbar',
                    // '.is-sticky .navbar-brand'
                ]
            })
        )
        .pipe(
            gulp.dest(styleFolder)
        )
    });
};