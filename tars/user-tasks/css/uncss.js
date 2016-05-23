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
                    '.cd-overlay-nav',
                    '.cd-overlay-content',
                    '.cd-overlay-content span',
                    '.cd-overlay-nav span',
                    '.cd-nav-trigger',
                    '.cd-nav-trigger .cd-icon:before', 
                    '.cd-nav-trigger .cd-icon:after',
                    '.cd-nav-trigger:before',
                    '.cd-nav-trigger:after',
                    '.cd-nav-trigger.close-nav:before',
                    '.cd-nav-trigger.close-nav:after',
                    '.cd-nav-trigger.close-nav .cd-icon',
                    '.cd-nav-trigger.close-nav .cd-icon:before', 
                    '.cd-nav-trigger.close-nav .cd-icon:after',
                    '.no-touch .cd-primary-nav a:hover', 
                    '.cd-primary-nav a:hover',
                    '.cd-primary-nav.fade-in',
                    '.cd-overlay-nav, .cd-overlay-content',
                    '.cd-overlay-nav span, .cd-overlay-content span ',
                    '.cd-overlay-nav.is-hidden', 
                    '.cd-overlay-content.is-hidden',
                    '.cd-nav-trigger .cd-icon',
                    '.cd-primary-nav',
                    '.cd-primary-nav li',
                    '.cd-primary-nav a',
                    '#counter-template',
                    '.counter .time',
                    '.counter .time.weeks',
                    '.counter .time.days',
                    '.counter .time + .dot',
                    '.counter .dot.seconds',
                    '.counter .dot.weeks',
                    '.counter .dot.days',
                    '.counter .dot',
                    '.counter .dot:before',
                    '.counter .count',
                    '.counter .count.top',
                    '.counter .count.bottom',
                    '.counter .label',
                    '.counter .count.curr.top',
                    '.counter .count.next.bottom',
                    '.counter .flip .count.curr.top',
                    '.counter .flip .count.next.bottom',
                    '.counter-wrapper',
                    '.counter'
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