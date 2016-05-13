'use strict';

// This is example of task function

const gulp = tars.packages.gulp;
const plumber = tars.packages.plumber;
const notifier = tars.helpers.notifier;
const del = tars.packages.del;

const tarsConfig = tars.config;
// Include browserSync, if you need to reload browser:
// const browserSync = tars.packages.browserSync;

/**
 * Task description
 */

var uncss = require('gulp-uncss');
// var uncss = require('uncss');
module.exports = function () {

    return gulp.task('uncss', /*['css:compile-css'],*/ function (cb) {
        del([tars.options.build.path + tars.config.fs.staticFolderName + '/css/*.min.css']).then(() => {
                //cb();
        })
      return gulp.src([
          './builds/assets/css/main.css'
        ])
        .pipe(
            uncss({
                html: [
                    './builds/index.html'
                ],
                ignore : [
                    '.sticky-wrapper',
                    '.is-sticky',
                    '.is-sticky .navbar',
                    '.is-sticky .navbar-brand'
                ]
            })
        )
        .pipe(
            gulp.dest('./builds/assets/css/')
        )
    });
};
