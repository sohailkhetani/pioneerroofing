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
                //timeout     : 2000,
                ignore : [
                    '.navbar-menu',
                    '.navbar-menu.open-menu',
                    '#sticker',
                    '.is-sticky #sticker',
                    '.is-sticky .block-main-button a',
                    '.is-sticky .block-main-button a:last-child',
                    '.is-sticky .block-main-button .yes-sticky',
                    '.is-sticky .block-main-button .yes-sticky i',
                    '.is-sticky .block-main-button .no-sticky',
                    '.is-sticky .block-main-button .button-gray',
                    '#sticker-nav',
                    '.overlay',
                    '.overlay-close',
                    '.overlay-title',
                    '.overlay-contact',
                    '.overlay-contact a',
                    '.overlay-contact span',
                    '.overlay nav',
                    '.overlay-menu',
                    '.overlay-menu li',
                    '.overlay-menu-img',
                    '.overlay-menu li a',
                    '.overlay-menu li a:hover',
                    '.overlay-menu li a:focus',
                    '.overlay-slidedown',
                    '.overlay-slidedown.open',
                    '.hmbrgr span',
                    '.hmbrgr.expand span:nth-child(1)',
                    '.hmbrgr.expand span:nth-child(2)',
                    '.hmbrgr.expand span:nth-child(3)',
                    '.js-toggle',
                    '.hmbrgr',
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
                    '.counter',
                    '.start-brand-animate',
                    '.start-brand-animate .navbar-brand-wrapper',
                    '.start-brand-animate .navbar-brand',
                    '.start-brand-animate .navbar-brand img',
                    '.block-main-overlay',
                    '.start-brand-animate .block-main-overlay',
                    '.start-brand-animate .block-main-overlay:before',
                    '.start-brand-animate .brand-overlay',
                    '.start-brand-animate .brand-overlay-animate',
                    '.start-animate .button-animate',
                    '.start-animate .block-main-title',
                    '.start-animate .block-main-image',
                    '.start-animate .navbar-menu',
                    '.start-animate .block-main-button',
                    '.start-animate .counter-wrapper',
                    '.start-animate .image-absolute',
                    '.start-animate .button-animate'
                ]
            })
        )
        .pipe(
            gulp.dest(styleFolder)
        )
    });
};
