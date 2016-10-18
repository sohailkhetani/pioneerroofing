/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );

/*!
 * The Final Countdown for jQuery v2.1.0 (http://hilios.github.io/jQuery.countdown/)
 * Copyright (c) 2015 Edson Hilios
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }
})(function($) {
    "use strict";
    var instances = [], matchers = [], defaultOptions = {
        precision: 100,
        elapse: false
    };
    matchers.push(/^[0-9]*$/.source);
    matchers.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
    matchers.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
    matchers = new RegExp(matchers.join("|"));
    function parseDateString(dateString) {
        if (dateString instanceof Date) {
            return dateString;
        }
        if (String(dateString).match(matchers)) {
            if (String(dateString).match(/^[0-9]*$/)) {
                dateString = Number(dateString);
            }
            if (String(dateString).match(/\-/)) {
                dateString = String(dateString).replace(/\-/g, "/");
            }
            return new Date(dateString);
        } else {
            throw new Error("Couldn't cast `" + dateString + "` to a date object.");
        }
    }
    var DIRECTIVE_KEY_MAP = {
        Y: "years",
        m: "months",
        n: "daysToMonth",
        w: "weeks",
        d: "daysToWeek",
        D: "totalDays",
        H: "hours",
        M: "minutes",
        S: "seconds"
    };
    function escapedRegExp(str) {
        var sanitize = str.toString().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        return new RegExp(sanitize);
    }
    function strftime(offsetObject) {
        return function(format) {
            var directives = format.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi);
            if (directives) {
                for (var i = 0, len = directives.length; i < len; ++i) {
                    var directive = directives[i].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/), regexp = escapedRegExp(directive[0]), modifier = directive[1] || "", plural = directive[3] || "", value = null;
                    directive = directive[2];
                    if (DIRECTIVE_KEY_MAP.hasOwnProperty(directive)) {
                        value = DIRECTIVE_KEY_MAP[directive];
                        value = Number(offsetObject[value]);
                    }
                    if (value !== null) {
                        if (modifier === "!") {
                            value = pluralize(plural, value);
                        }
                        if (modifier === "") {
                            if (value < 10) {
                                value = "0" + value.toString();
                            }
                        }
                        format = format.replace(regexp, value.toString());
                    }
                }
            }
            format = format.replace(/%%/, "%");
            return format;
        };
    }
    function pluralize(format, count) {
        var plural = "s", singular = "";
        if (format) {
            format = format.replace(/(:|;|\s)/gi, "").split(/\,/);
            if (format.length === 1) {
                plural = format[0];
            } else {
                singular = format[0];
                plural = format[1];
            }
        }
        if (Math.abs(count) === 1) {
            return singular;
        } else {
            return plural;
        }
    }
    var Countdown = function(el, finalDate, options) {
        this.el = el;
        this.$el = $(el);
        this.interval = null;
        this.offset = {};
        this.options = $.extend({}, defaultOptions);
        this.instanceNumber = instances.length;
        instances.push(this);
        this.$el.data("countdown-instance", this.instanceNumber);
        if (options) {
            if (typeof options === "function") {
                this.$el.on("update.countdown", options);
                this.$el.on("stoped.countdown", options);
                this.$el.on("finish.countdown", options);
            } else {
                this.options = $.extend({}, defaultOptions, options);
            }
        }
        this.setFinalDate(finalDate);
        this.start();
    };
    $.extend(Countdown.prototype, {
        start: function() {
            if (this.interval !== null) {
                clearInterval(this.interval);
            }
            var self = this;
            this.update();
            this.interval = setInterval(function() {
                self.update.call(self);
            }, this.options.precision);
        },
        stop: function() {
            clearInterval(this.interval);
            this.interval = null;
            this.dispatchEvent("stoped");
        },
        toggle: function() {
            if (this.interval) {
                this.stop();
            } else {
                this.start();
            }
        },
        pause: function() {
            this.stop();
        },
        resume: function() {
            this.start();
        },
        remove: function() {
            this.stop.call(this);
            instances[this.instanceNumber] = null;
            delete this.$el.data().countdownInstance;
        },
        setFinalDate: function(value) {
            this.finalDate = parseDateString(value);
        },
        update: function() {
            if (this.$el.closest("html").length === 0) {
                this.remove();
                return;
            }
            var hasEventsAttached = $._data(this.el, "events") !== undefined, now = new Date(), newTotalSecsLeft;
            newTotalSecsLeft = this.finalDate.getTime() - now.getTime();
            newTotalSecsLeft = Math.ceil(newTotalSecsLeft / 1e3);
            newTotalSecsLeft = !this.options.elapse && newTotalSecsLeft < 0 ? 0 : Math.abs(newTotalSecsLeft);
            if (this.totalSecsLeft === newTotalSecsLeft || !hasEventsAttached) {
                return;
            } else {
                this.totalSecsLeft = newTotalSecsLeft;
            }
            this.elapsed = now >= this.finalDate;
            this.offset = {
                seconds: this.totalSecsLeft % 60,
                minutes: Math.floor(this.totalSecsLeft / 60) % 60,
                hours: Math.floor(this.totalSecsLeft / 60 / 60) % 24,
                days: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                daysToWeek: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                daysToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 % 30.4368),
                totalDays: Math.floor(this.totalSecsLeft / 60 / 60 / 24),
                weeks: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7),
                months: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 30.4368),
                years: Math.abs(this.finalDate.getFullYear() - now.getFullYear())
            };
            if (!this.options.elapse && this.totalSecsLeft === 0) {
                this.stop();
                this.dispatchEvent("finish");
            } else {
                this.dispatchEvent("update");
            }
        },
        dispatchEvent: function(eventName) {
            var event = $.Event(eventName + ".countdown");
            event.finalDate = this.finalDate;
            event.elapsed = this.elapsed;
            event.offset = $.extend({}, this.offset);
            event.strftime = strftime(this.offset);
            this.$el.trigger(event);
        }
    });
    $.fn.countdown = function() {
        var argumentsArray = Array.prototype.slice.call(arguments, 0);
        return this.each(function() {
            var instanceNumber = $(this).data("countdown-instance");
            if (instanceNumber !== undefined) {
                var instance = instances[instanceNumber], method = argumentsArray[0];
                if (Countdown.prototype.hasOwnProperty(method)) {
                    instance[method].apply(instance, argumentsArray.slice(1));
                } else if (String(method).match(/^[$A-Z_][0-9A-Z_$]*$/i) === null) {
                    instance.setFinalDate.call(instance, method);
                    instance.start();
                } else {
                    $.error("Method %s does not exist on jQuery.countdown".replace(/\%s/gi, method));
                }
            } else {
                new Countdown(this, argumentsArray[0], argumentsArray[1]);
            }
        });
    };
});
/*!
 * jquery-hmbrgr.js v0.0.2
 * https://github.com/MorenoDiDomenico/jquery-hmbrgr
 *
 * Copyright 2015, Moreno Di Domenico
 * Released under the MIT license
 * http://mdd.mit-license.org
 *
 */

(function ( $ ) {

  $.fn.hmbrgr = function( settings ){

    var config = $.extend( {
      width     : 60,
      height    : 50,
      speed     : 200,
      barHeight : 8,
      barRadius : 0,
      barColor  : '#ffffff',
      animation : 'expand',
      onInit    : null,
      onOpen    : null,
      onClose   : null
    }, settings);

    var posTop    = 0,
        posMiddle = (config.height/2) - (config.barHeight/2),
        posBottom = config.height - config.barHeight;

    function hmbrgrBuild(el){
      $(el)
      .css({
        'width'     : config.width,
        'height'    : config.height
      })
      .html('<span /><span /><span />')
      .find('span').css({
        'position'            : 'absolute',
        'width'               : '100%',
        'height'              : config.barHeight,
        'border-radius'       : config.barRadius,
        'background-color'    : config.barColor,
        'transition-duration' : config.speed+'ms'
      });

      hmbrgrSpanReset(el);
      $.isFunction(config.onInit) && config.onInit.call(this);
    }

    function hmbrgrSpanReset(el){
      $(el)
      .data('clickable', true)
      .find('span').eq(0).css({
        'top' : posTop
      });

      $(el)
      .find('span').eq(1).css({
        'top' : posMiddle
      });

      $(el)
      .find('span').eq(2).css({
        'top' : posBottom
      });
    }

    function hmbrgrCommand(el){
      $(el).on('click', function(e){
        e.preventDefault();

        if($(this).data('clickable')){

          $(this).data('clickable', false);
          
          $(el).toggleClass('cross');

          if( $(el).hasClass('cross') )
            hmbrgrExpand(el);
          else
            hmbrgrCollapse(el);
        }
      });
    }

    function hmbrgrExpand(el){
      $(el).find('span').css({
        top : posMiddle
      });

      setTimeout(function(){
        $(el).addClass(config.animation).data('clickable', true);
        $.isFunction(config.onOpen) && config.onOpen.call(this);
      }, config.speed);
    }

    function hmbrgrCollapse(el){
      $(el).removeClass(config.animation);

      setTimeout(function(){
        hmbrgrSpanReset(el);
        $.isFunction(config.onClose) && config.onClose.call(this);
      }, config.speed);
    }

    return this.each(function(){
      hmbrgrBuild(this);
      hmbrgrCommand(this);
    });

  };

}( jQuery ));

/**
* jquery.matchHeight-min.js master
* http://brm.io/jquery-match-height/
* License: MIT
*/
(function(c){var n=-1,f=-1,g=function(a){return parseFloat(a)||0},r=function(a){var b=null,d=[];c(a).each(function(){var a=c(this),k=a.offset().top-g(a.css("margin-top")),l=0<d.length?d[d.length-1]:null;null===l?d.push(a):1>=Math.floor(Math.abs(b-k))?d[d.length-1]=l.add(a):d.push(a);b=k});return d},p=function(a){var b={byRow:!0,property:"height",target:null,remove:!1};if("object"===typeof a)return c.extend(b,a);"boolean"===typeof a?b.byRow=a:"remove"===a&&(b.remove=!0);return b},b=c.fn.matchHeight=
function(a){a=p(a);if(a.remove){var e=this;this.css(a.property,"");c.each(b._groups,function(a,b){b.elements=b.elements.not(e)});return this}if(1>=this.length&&!a.target)return this;b._groups.push({elements:this,options:a});b._apply(this,a);return this};b._groups=[];b._throttle=80;b._maintainScroll=!1;b._beforeUpdate=null;b._afterUpdate=null;b._apply=function(a,e){var d=p(e),h=c(a),k=[h],l=c(window).scrollTop(),f=c("html").outerHeight(!0),m=h.parents().filter(":hidden");m.each(function(){var a=c(this);
a.data("style-cache",a.attr("style"))});m.css("display","block");d.byRow&&!d.target&&(h.each(function(){var a=c(this),b=a.css("display");"inline-block"!==b&&"inline-flex"!==b&&(b="block");a.data("style-cache",a.attr("style"));a.css({display:b,"padding-top":"0","padding-bottom":"0","margin-top":"0","margin-bottom":"0","border-top-width":"0","border-bottom-width":"0",height:"100px"})}),k=r(h),h.each(function(){var a=c(this);a.attr("style",a.data("style-cache")||"")}));c.each(k,function(a,b){var e=c(b),
f=0;if(d.target)f=d.target.outerHeight(!1);else{if(d.byRow&&1>=e.length){e.css(d.property,"");return}e.each(function(){var a=c(this),b=a.css("display");"inline-block"!==b&&"inline-flex"!==b&&(b="block");b={display:b};b[d.property]="";a.css(b);a.outerHeight(!1)>f&&(f=a.outerHeight(!1));a.css("display","")})}e.each(function(){var a=c(this),b=0;d.target&&a.is(d.target)||("border-box"!==a.css("box-sizing")&&(b+=g(a.css("border-top-width"))+g(a.css("border-bottom-width")),b+=g(a.css("padding-top"))+g(a.css("padding-bottom"))),
a.css(d.property,f-b+"px"))})});m.each(function(){var a=c(this);a.attr("style",a.data("style-cache")||null)});b._maintainScroll&&c(window).scrollTop(l/f*c("html").outerHeight(!0));return this};b._applyDataApi=function(){var a={};c("[data-match-height], [data-mh]").each(function(){var b=c(this),d=b.attr("data-mh")||b.attr("data-match-height");a[d]=d in a?a[d].add(b):b});c.each(a,function(){this.matchHeight(!0)})};var q=function(a){b._beforeUpdate&&b._beforeUpdate(a,b._groups);c.each(b._groups,function(){b._apply(this.elements,
this.options)});b._afterUpdate&&b._afterUpdate(a,b._groups)};b._update=function(a,e){if(e&&"resize"===e.type){var d=c(window).width();if(d===n)return;n=d}a?-1===f&&(f=setTimeout(function(){q(e);f=-1},b._throttle)):q(e)};c(b._applyDataApi);c(window).bind("load",function(a){b._update(!1,a)});c(window).bind("resize orientationchange",function(a){b._update(!0,a)})})(jQuery);
// Sticky Plugin v1.0.3 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 02/14/2011
// Date: 07/20/2015
// Website: http://stickyjs.com/
// Description: Makes an element on the page stick on the screen as you scroll
//              It will only set the 'top' and 'position' of your element, you
//              might need to adjust the width in some cases.

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var slice = Array.prototype.slice; // save ref to original slice()
    var splice = Array.prototype.splice; // save ref to original slice()

  var defaults = {
      topSpacing: 0,
      bottomSpacing: 0,
      className: 'is-sticky',
      wrapperClassName: 'sticky-wrapper',
      center: false,
      getWidthFrom: '',
      widthFromWrapper: true, // works only when .getWidthFrom is empty
      responsiveWidth: false
    },
    $window = $(window),
    $document = $(document),
    sticked = [],
    windowHeight = $window.height(),
    scroller = function() {
      var scrollTop = $window.scrollTop(),
        documentHeight = $document.height(),
        dwh = documentHeight - windowHeight,
        extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

      for (var i = 0, l = sticked.length; i < l; i++) {
        var s = sticked[i],
          elementTop = s.stickyWrapper.offset().top,
          etse = elementTop - s.topSpacing - extra;

        //update height in case of dynamic content
        s.stickyWrapper.css('height', s.stickyElement.outerHeight());

        if (scrollTop <= etse) {
          if (s.currentTop !== null) {
            s.stickyElement
              .css({
                'width': '',
                'position': '',
                'top': ''
              });
            s.stickyElement.parent().removeClass(s.className);
            s.stickyElement.trigger('sticky-end', [s]);
            s.currentTop = null;
          }
        }
        else {
          var newTop = documentHeight - s.stickyElement.outerHeight()
            - s.topSpacing - s.bottomSpacing - scrollTop - extra;
          if (newTop < 0) {
            newTop = newTop + s.topSpacing;
          } else {
            newTop = s.topSpacing;
          }
          if (s.currentTop !== newTop) {
            var newWidth;
            if (s.getWidthFrom) {
                newWidth = $(s.getWidthFrom).width() || null;
            } else if (s.widthFromWrapper) {
                newWidth = s.stickyWrapper.width();
            }
            if (newWidth == null) {
                newWidth = s.stickyElement.width();
            }
            s.stickyElement
              .css('width', newWidth)
              .css('position', 'fixed')
              .css('top', newTop);

            s.stickyElement.parent().addClass(s.className);

            if (s.currentTop === null) {
              s.stickyElement.trigger('sticky-start', [s]);
            } else {
              // sticky is started but it have to be repositioned
              s.stickyElement.trigger('sticky-update', [s]);
            }

            if (s.currentTop === s.topSpacing && s.currentTop > newTop || s.currentTop === null && newTop < s.topSpacing) {
              // just reached bottom || just started to stick but bottom is already reached
              s.stickyElement.trigger('sticky-bottom-reached', [s]);
            } else if(s.currentTop !== null && newTop === s.topSpacing && s.currentTop < newTop) {
              // sticky is started && sticked at topSpacing && overflowing from top just finished
              s.stickyElement.trigger('sticky-bottom-unreached', [s]);
            }

            s.currentTop = newTop;
          }

          // Check if sticky has reached end of container and stop sticking
          var stickyWrapperContainer = s.stickyWrapper.parent();
          var unstick = (s.stickyElement.offset().top + s.stickyElement.outerHeight() >= stickyWrapperContainer.offset().top + stickyWrapperContainer.outerHeight()) && (s.stickyElement.offset().top <= s.topSpacing);

          if( unstick ) {
            s.stickyElement
              .css('position', 'absolute')
              .css('top', '')
              .css('bottom', 0);
          } else {
            s.stickyElement
              .css('position', 'fixed')
              .css('top', newTop)
              .css('bottom', '');
          }
        }
      }
    },
    resizer = function() {
      windowHeight = $window.height();

      for (var i = 0, l = sticked.length; i < l; i++) {
        var s = sticked[i];
        var newWidth = null;
        if (s.getWidthFrom) {
            if (s.responsiveWidth) {
                newWidth = $(s.getWidthFrom).width();
            }
        } else if(s.widthFromWrapper) {
            newWidth = s.stickyWrapper.width();
        }
        if (newWidth != null) {
            s.stickyElement.css('width', newWidth);
        }
      }
    },
    methods = {
      init: function(options) {
        var o = $.extend({}, defaults, options);
        return this.each(function() {
          var stickyElement = $(this);

          var stickyId = stickyElement.attr('id');
          var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName;
          var wrapper = $('<div></div>')
            .attr('id', wrapperId)
            .addClass(o.wrapperClassName);

          stickyElement.wrapAll(wrapper);

          var stickyWrapper = stickyElement.parent();

          if (o.center) {
            stickyWrapper.css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
          }

          if (stickyElement.css("float") === "right") {
            stickyElement.css({"float":"none"}).parent().css({"float":"right"});
          }

          o.stickyElement = stickyElement;
          o.stickyWrapper = stickyWrapper;
          o.currentTop    = null;

          sticked.push(o);

          methods.setWrapperHeight(this);
          methods.setupChangeListeners(this);
        });
      },

      setWrapperHeight: function(stickyElement) {
        var element = $(stickyElement);
        var stickyWrapper = element.parent();
        if (stickyWrapper) {
          stickyWrapper.css('height', element.outerHeight());
        }
      },

      setupChangeListeners: function(stickyElement) {
        if (window.MutationObserver) {
          var mutationObserver = new window.MutationObserver(function(mutations) {
            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
              methods.setWrapperHeight(stickyElement);
            }
          });
          mutationObserver.observe(stickyElement, {subtree: true, childList: true});
        } else {
          stickyElement.addEventListener('DOMNodeInserted', function() {
            methods.setWrapperHeight(stickyElement);
          }, false);
          stickyElement.addEventListener('DOMNodeRemoved', function() {
            methods.setWrapperHeight(stickyElement);
          }, false);
        }
      },
      update: scroller,
      unstick: function(options) {
        return this.each(function() {
          var that = this;
          var unstickyElement = $(that);

          var removeIdx = -1;
          var i = sticked.length;
          while (i-- > 0) {
            if (sticked[i].stickyElement.get(0) === that) {
                splice.call(sticked,i,1);
                removeIdx = i;
            }
          }
          if(removeIdx !== -1) {
            unstickyElement.unwrap();
            unstickyElement
              .css({
                'width': '',
                'position': '',
                'top': '',
                'float': ''
              })
            ;
          }
        });
      }
    };

  // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
  if (window.addEventListener) {
    window.addEventListener('scroll', scroller, false);
    window.addEventListener('resize', resizer, false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', scroller);
    window.attachEvent('onresize', resizer);
  }

  $.fn.sticky = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };

  $.fn.unstick = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.unstick.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };
  $(function() {
    setTimeout(scroller, 0);
  });
}));

/**
 * @license
 * lodash 3.10.1 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash compat -o ./lodash.js`
 */
;(function(){function n(n,t){if(n!==t){var r=null===n,e=n===w,u=n===n,o=null===t,i=t===w,f=t===t;if(n>t&&!o||!u||r&&!i&&f||e&&f)return 1;if(n<t&&!r||!f||o&&!e&&u||i&&u)return-1}return 0}function t(n,t,r){for(var e=n.length,u=r?e:-1;r?u--:++u<e;)if(t(n[u],u,n))return u;return-1}function r(n,t,r){if(t!==t)return p(n,r);r-=1;for(var e=n.length;++r<e;)if(n[r]===t)return r;return-1}function e(n){return typeof n=="function"||false}function u(n){return null==n?"":n+""}function o(n,t){for(var r=-1,e=n.length;++r<e&&-1<t.indexOf(n.charAt(r)););
return r}function i(n,t){for(var r=n.length;r--&&-1<t.indexOf(n.charAt(r)););return r}function f(t,r){return n(t.a,r.a)||t.b-r.b}function a(n){return Nn[n]}function c(n){return Tn[n]}function l(n,t,r){return t?n=Bn[n]:r&&(n=Dn[n]),"\\"+n}function s(n){return"\\"+Dn[n]}function p(n,t,r){var e=n.length;for(t+=r?0:-1;r?t--:++t<e;){var u=n[t];if(u!==u)return t}return-1}function h(n){return!!n&&typeof n=="object"}function _(n){return 160>=n&&9<=n&&13>=n||32==n||160==n||5760==n||6158==n||8192<=n&&(8202>=n||8232==n||8233==n||8239==n||8287==n||12288==n||65279==n);
}function v(n,t){for(var r=-1,e=n.length,u=-1,o=[];++r<e;)n[r]===t&&(n[r]=P,o[++u]=r);return o}function g(n){for(var t=-1,r=n.length;++t<r&&_(n.charCodeAt(t)););return t}function y(n){for(var t=n.length;t--&&_(n.charCodeAt(t)););return t}function d(n){return Pn[n]}function m(_){function Nn(n){if(h(n)&&!(Wo(n)||n instanceof zn)){if(n instanceof Pn)return n;if(eu.call(n,"__chain__")&&eu.call(n,"__wrapped__"))return qr(n)}return new Pn(n)}function Tn(){}function Pn(n,t,r){this.__wrapped__=n,this.__actions__=r||[],
this.__chain__=!!t}function zn(n){this.__wrapped__=n,this.__actions__=[],this.__dir__=1,this.__filtered__=false,this.__iteratees__=[],this.__takeCount__=Cu,this.__views__=[]}function Bn(){this.__data__={}}function Dn(n){var t=n?n.length:0;for(this.data={hash:mu(null),set:new hu};t--;)this.push(n[t])}function Mn(n,t){var r=n.data;return(typeof t=="string"||de(t)?r.set.has(t):r.hash[t])?0:-1}function qn(n,t){var r=-1,e=n.length;for(t||(t=De(e));++r<e;)t[r]=n[r];return t}function Kn(n,t){for(var r=-1,e=n.length;++r<e&&false!==t(n[r],r,n););
return n}function Vn(n,t){for(var r=-1,e=n.length;++r<e;)if(!t(n[r],r,n))return false;return true}function Zn(n,t){for(var r=-1,e=n.length,u=-1,o=[];++r<e;){var i=n[r];t(i,r,n)&&(o[++u]=i)}return o}function Xn(n,t){for(var r=-1,e=n.length,u=De(e);++r<e;)u[r]=t(n[r],r,n);return u}function Hn(n,t){for(var r=-1,e=t.length,u=n.length;++r<e;)n[u+r]=t[r];return n}function Qn(n,t,r,e){var u=-1,o=n.length;for(e&&o&&(r=n[++u]);++u<o;)r=t(r,n[u],u,n);return r}function nt(n,t){for(var r=-1,e=n.length;++r<e;)if(t(n[r],r,n))return true;
return false}function tt(n,t,r,e){return n!==w&&eu.call(e,r)?n:t}function rt(n,t,r){for(var e=-1,u=Ko(t),o=u.length;++e<o;){var i=u[e],f=n[i],a=r(f,t[i],i,n,t);(a===a?a===f:f!==f)&&(f!==w||i in n)||(n[i]=a)}return n}function et(n,t){return null==t?n:ot(t,Ko(t),n)}function ut(n,t){for(var r=-1,e=null==n,u=!e&&Sr(n),o=u?n.length:0,i=t.length,f=De(i);++r<i;){var a=t[r];f[r]=u?Ur(a,o)?n[a]:w:e?w:n[a]}return f}function ot(n,t,r){r||(r={});for(var e=-1,u=t.length;++e<u;){var o=t[e];r[o]=n[o]}return r}function it(n,t,r){
var e=typeof n;return"function"==e?t===w?n:Dt(n,t,r):null==n?Ne:"object"==e?At(n):t===w?Be(n):jt(n,t)}function ft(n,t,r,e,u,o,i){var f;if(r&&(f=u?r(n,e,u):r(n)),f!==w)return f;if(!de(n))return n;if(e=Wo(n)){if(f=Ir(n),!t)return qn(n,f)}else{var a=ou.call(n),c=a==K;if(a!=Z&&a!=z&&(!c||u))return Ln[a]?Er(n,a,t):u?n:{};if(Gn(n))return u?n:{};if(f=Rr(c?{}:n),!t)return et(f,n)}for(o||(o=[]),i||(i=[]),u=o.length;u--;)if(o[u]==n)return i[u];return o.push(n),i.push(f),(e?Kn:gt)(n,function(e,u){f[u]=ft(e,t,r,u,n,o,i);
}),f}function at(n,t,r){if(typeof n!="function")throw new Xe(T);return _u(function(){n.apply(w,r)},t)}function ct(n,t){var e=n?n.length:0,u=[];if(!e)return u;var o=-1,i=jr(),f=i===r,a=f&&t.length>=F&&mu&&hu?new Dn(t):null,c=t.length;a&&(i=Mn,f=false,t=a);n:for(;++o<e;)if(a=n[o],f&&a===a){for(var l=c;l--;)if(t[l]===a)continue n;u.push(a)}else 0>i(t,a,0)&&u.push(a);return u}function lt(n,t){var r=true;return zu(n,function(n,e,u){return r=!!t(n,e,u)}),r}function st(n,t,r,e){var u=e,o=u;return zu(n,function(n,i,f){
i=+t(n,i,f),(r(i,u)||i===e&&i===o)&&(u=i,o=n)}),o}function pt(n,t){var r=[];return zu(n,function(n,e,u){t(n,e,u)&&r.push(n)}),r}function ht(n,t,r,e){var u;return r(n,function(n,r,o){return t(n,r,o)?(u=e?r:n,false):void 0}),u}function _t(n,t,r,e){e||(e=[]);for(var u=-1,o=n.length;++u<o;){var i=n[u];h(i)&&Sr(i)&&(r||Wo(i)||_e(i))?t?_t(i,t,r,e):Hn(e,i):r||(e[e.length]=i)}return e}function vt(n,t){return Du(n,t,Ee)}function gt(n,t){return Du(n,t,Ko)}function yt(n,t){return Mu(n,t,Ko)}function dt(n,t){for(var r=-1,e=t.length,u=-1,o=[];++r<e;){
var i=t[r];ye(n[i])&&(o[++u]=i)}return o}function mt(n,t,r){if(null!=n){n=Dr(n),r!==w&&r in n&&(t=[r]),r=0;for(var e=t.length;null!=n&&r<e;)n=Dr(n)[t[r++]];return r&&r==e?n:w}}function wt(n,t,r,e,u,o){if(n===t)return true;if(null==n||null==t||!de(n)&&!h(t))return n!==n&&t!==t;n:{var i=wt,f=Wo(n),a=Wo(t),c=B,l=B;f||(c=ou.call(n),c==z?c=Z:c!=Z&&(f=je(n))),a||(l=ou.call(t),l==z?l=Z:l!=Z&&je(t));var s=c==Z&&!Gn(n),a=l==Z&&!Gn(t),l=c==l;if(!l||f||s){if(!e&&(c=s&&eu.call(n,"__wrapped__"),a=a&&eu.call(t,"__wrapped__"),
c||a)){n=i(c?n.value():n,a?t.value():t,r,e,u,o);break n}if(l){for(u||(u=[]),o||(o=[]),c=u.length;c--;)if(u[c]==n){n=o[c]==t;break n}u.push(n),o.push(t),n=(f?mr:xr)(n,t,i,r,e,u,o),u.pop(),o.pop()}else n=false}else n=wr(n,t,c)}return n}function xt(n,t,r){var e=t.length,u=e,o=!r;if(null==n)return!u;for(n=Dr(n);e--;){var i=t[e];if(o&&i[2]?i[1]!==n[i[0]]:!(i[0]in n))return false}for(;++e<u;){var i=t[e],f=i[0],a=n[f],c=i[1];if(o&&i[2]){if(a===w&&!(f in n))return false}else if(i=r?r(a,c,f):w,i===w?!wt(c,a,r,true):!i)return false;
}return true}function bt(n,t){var r=-1,e=Sr(n)?De(n.length):[];return zu(n,function(n,u,o){e[++r]=t(n,u,o)}),e}function At(n){var t=kr(n);if(1==t.length&&t[0][2]){var r=t[0][0],e=t[0][1];return function(n){return null==n?false:(n=Dr(n),n[r]===e&&(e!==w||r in n))}}return function(n){return xt(n,t)}}function jt(n,t){var r=Wo(n),e=Wr(n)&&t===t&&!de(t),u=n+"";return n=Mr(n),function(o){if(null==o)return false;var i=u;if(o=Dr(o),!(!r&&e||i in o)){if(o=1==n.length?o:mt(o,St(n,0,-1)),null==o)return false;i=Gr(n),o=Dr(o);
}return o[i]===t?t!==w||i in o:wt(t,o[i],w,true)}}function kt(n,t,r,e,u){if(!de(n))return n;var o=Sr(t)&&(Wo(t)||je(t)),i=o?w:Ko(t);return Kn(i||t,function(f,a){if(i&&(a=f,f=t[a]),h(f)){e||(e=[]),u||(u=[]);n:{for(var c=a,l=e,s=u,p=l.length,_=t[c];p--;)if(l[p]==_){n[c]=s[p];break n}var p=n[c],v=r?r(p,_,c,n,t):w,g=v===w;g&&(v=_,Sr(_)&&(Wo(_)||je(_))?v=Wo(p)?p:Sr(p)?qn(p):[]:xe(_)||_e(_)?v=_e(p)?Ie(p):xe(p)?p:{}:g=false),l.push(_),s.push(v),g?n[c]=kt(v,_,r,l,s):(v===v?v!==p:p===p)&&(n[c]=v)}}else c=n[a],
l=r?r(c,f,a,n,t):w,(s=l===w)&&(l=f),l===w&&(!o||a in n)||!s&&(l===l?l===c:c!==c)||(n[a]=l)}),n}function Ot(n){return function(t){return null==t?w:Dr(t)[n]}}function It(n){var t=n+"";return n=Mr(n),function(r){return mt(r,n,t)}}function Rt(n,t){for(var r=n?t.length:0;r--;){var e=t[r];if(e!=u&&Ur(e)){var u=e;vu.call(n,e,1)}}return n}function Et(n,t){return n+wu(Ru()*(t-n+1))}function Ct(n,t,r,e,u){return u(n,function(n,u,o){r=e?(e=false,n):t(r,n,u,o)}),r}function St(n,t,r){var e=-1,u=n.length;for(t=null==t?0:+t||0,
0>t&&(t=-t>u?0:u+t),r=r===w||r>u?u:+r||0,0>r&&(r+=u),u=t>r?0:r-t>>>0,t>>>=0,r=De(u);++e<u;)r[e]=n[e+t];return r}function Ut(n,t){var r;return zu(n,function(n,e,u){return r=t(n,e,u),!r}),!!r}function $t(n,t){var r=n.length;for(n.sort(t);r--;)n[r]=n[r].c;return n}function Wt(t,r,e){var u=br(),o=-1;return r=Xn(r,function(n){return u(n)}),t=bt(t,function(n){return{a:Xn(r,function(t){return t(n)}),b:++o,c:n}}),$t(t,function(t,r){var u;n:{for(var o=-1,i=t.a,f=r.a,a=i.length,c=e.length;++o<a;)if(u=n(i[o],f[o])){
if(o>=c)break n;o=e[o],u*="asc"===o||true===o?1:-1;break n}u=t.b-r.b}return u})}function Ft(n,t){var r=0;return zu(n,function(n,e,u){r+=+t(n,e,u)||0}),r}function Lt(n,t){var e=-1,u=jr(),o=n.length,i=u===r,f=i&&o>=F,a=f&&mu&&hu?new Dn(void 0):null,c=[];a?(u=Mn,i=false):(f=false,a=t?[]:c);n:for(;++e<o;){var l=n[e],s=t?t(l,e,n):l;if(i&&l===l){for(var p=a.length;p--;)if(a[p]===s)continue n;t&&a.push(s),c.push(l)}else 0>u(a,s,0)&&((t||f)&&a.push(s),c.push(l))}return c}function Nt(n,t){for(var r=-1,e=t.length,u=De(e);++r<e;)u[r]=n[t[r]];
return u}function Tt(n,t,r,e){for(var u=n.length,o=e?u:-1;(e?o--:++o<u)&&t(n[o],o,n););return r?St(n,e?0:o,e?o+1:u):St(n,e?o+1:0,e?u:o)}function Pt(n,t){var r=n;r instanceof zn&&(r=r.value());for(var e=-1,u=t.length;++e<u;)var o=t[e],r=o.func.apply(o.thisArg,Hn([r],o.args));return r}function zt(n,t,r){var e=0,u=n?n.length:e;if(typeof t=="number"&&t===t&&u<=Uu){for(;e<u;){var o=e+u>>>1,i=n[o];(r?i<=t:i<t)&&null!==i?e=o+1:u=o}return u}return Bt(n,t,Ne,r)}function Bt(n,t,r,e){t=r(t);for(var u=0,o=n?n.length:0,i=t!==t,f=null===t,a=t===w;u<o;){
var c=wu((u+o)/2),l=r(n[c]),s=l!==w,p=l===l;(i?p||e:f?p&&s&&(e||null!=l):a?p&&(e||s):null==l?0:e?l<=t:l<t)?u=c+1:o=c}return ku(o,Su)}function Dt(n,t,r){if(typeof n!="function")return Ne;if(t===w)return n;switch(r){case 1:return function(r){return n.call(t,r)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,o){return n.call(t,r,e,u,o)};case 5:return function(r,e,u,o,i){return n.call(t,r,e,u,o,i)}}return function(){return n.apply(t,arguments)}}function Mt(n){var t=new au(n.byteLength);
return new gu(t).set(new gu(n)),t}function qt(n,t,r){for(var e=r.length,u=-1,o=ju(n.length-e,0),i=-1,f=t.length,a=De(f+o);++i<f;)a[i]=t[i];for(;++u<e;)a[r[u]]=n[u];for(;o--;)a[i++]=n[u++];return a}function Kt(n,t,r){for(var e=-1,u=r.length,o=-1,i=ju(n.length-u,0),f=-1,a=t.length,c=De(i+a);++o<i;)c[o]=n[o];for(i=o;++f<a;)c[i+f]=t[f];for(;++e<u;)c[i+r[e]]=n[o++];return c}function Vt(n,t){return function(r,e,u){var o=t?t():{};if(e=br(e,u,3),Wo(r)){u=-1;for(var i=r.length;++u<i;){var f=r[u];n(o,f,e(f,u,r),r);
}}else zu(r,function(t,r,u){n(o,t,e(t,r,u),u)});return o}}function Zt(n){return pe(function(t,r){var e=-1,u=null==t?0:r.length,o=2<u?r[u-2]:w,i=2<u?r[2]:w,f=1<u?r[u-1]:w;for(typeof o=="function"?(o=Dt(o,f,5),u-=2):(o=typeof f=="function"?f:w,u-=o?1:0),i&&$r(r[0],r[1],i)&&(o=3>u?w:o,u=1);++e<u;)(i=r[e])&&n(t,i,o);return t})}function Yt(n,t){return function(r,e){var u=r?Vu(r):0;if(!Lr(u))return n(r,e);for(var o=t?u:-1,i=Dr(r);(t?o--:++o<u)&&false!==e(i[o],o,i););return r}}function Gt(n){return function(t,r,e){
var u=Dr(t);e=e(t);for(var o=e.length,i=n?o:-1;n?i--:++i<o;){var f=e[i];if(false===r(u[f],f,u))break}return t}}function Jt(n,t){function r(){return(this&&this!==Yn&&this instanceof r?e:n).apply(t,arguments)}var e=Ht(n);return r}function Xt(n){return function(t){var r=-1;t=Fe(Ue(t));for(var e=t.length,u="";++r<e;)u=n(u,t[r],r);return u}}function Ht(n){return function(){var t=arguments;switch(t.length){case 0:return new n;case 1:return new n(t[0]);case 2:return new n(t[0],t[1]);case 3:return new n(t[0],t[1],t[2]);
case 4:return new n(t[0],t[1],t[2],t[3]);case 5:return new n(t[0],t[1],t[2],t[3],t[4]);case 6:return new n(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new n(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var r=Pu(n.prototype),t=n.apply(r,t);return de(t)?t:r}}function Qt(n){function t(r,e,u){return u&&$r(r,e,u)&&(e=w),r=dr(r,n,w,w,w,w,w,e),r.placeholder=t.placeholder,r}return t}function nr(n,t){return pe(function(r){var e=r[0];return null==e?e:(r.push(t),n.apply(w,r))})}function tr(n,t){return function(r,e,u){
if(u&&$r(r,e,u)&&(e=w),e=br(e,u,3),1==e.length){u=r=Wo(r)?r:Br(r);for(var o=e,i=-1,f=u.length,a=t,c=a;++i<f;){var l=u[i],s=+o(l);n(s,a)&&(a=s,c=l)}if(u=c,!r.length||u!==t)return u}return st(r,e,n,t)}}function rr(n,r){return function(e,u,o){return u=br(u,o,3),Wo(e)?(u=t(e,u,r),-1<u?e[u]:w):ht(e,u,n)}}function er(n){return function(r,e,u){return r&&r.length?(e=br(e,u,3),t(r,e,n)):-1}}function ur(n){return function(t,r,e){return r=br(r,e,3),ht(t,r,n,true)}}function or(n){return function(){for(var t,r=arguments.length,e=n?r:-1,u=0,o=De(r);n?e--:++e<r;){
var i=o[u++]=arguments[e];if(typeof i!="function")throw new Xe(T);!t&&Pn.prototype.thru&&"wrapper"==Ar(i)&&(t=new Pn([],true))}for(e=t?-1:r;++e<r;){var i=o[e],u=Ar(i),f="wrapper"==u?Ku(i):w;t=f&&Fr(f[0])&&f[1]==(E|k|I|C)&&!f[4].length&&1==f[9]?t[Ar(f[0])].apply(t,f[3]):1==i.length&&Fr(i)?t[u]():t.thru(i)}return function(){var n=arguments,e=n[0];if(t&&1==n.length&&Wo(e)&&e.length>=F)return t.plant(e).value();for(var u=0,n=r?o[u].apply(this,n):e;++u<r;)n=o[u].call(this,n);return n}}}function ir(n,t){
return function(r,e,u){return typeof e=="function"&&u===w&&Wo(r)?n(r,e):t(r,Dt(e,u,3))}}function fr(n){return function(t,r,e){return(typeof r!="function"||e!==w)&&(r=Dt(r,e,3)),n(t,r,Ee)}}function ar(n){return function(t,r,e){return(typeof r!="function"||e!==w)&&(r=Dt(r,e,3)),n(t,r)}}function cr(n){return function(t,r,e){var u={};return r=br(r,e,3),gt(t,function(t,e,o){o=r(t,e,o),e=n?o:e,t=n?t:o,u[e]=t}),u}}function lr(n){return function(t,r,e){return t=u(t),(n?t:"")+_r(t,r,e)+(n?"":t)}}function sr(n){
var t=pe(function(r,e){var u=v(e,t.placeholder);return dr(r,n,w,e,u)});return t}function pr(n,t){return function(r,e,u,o){var i=3>arguments.length;return typeof e=="function"&&o===w&&Wo(r)?n(r,e,u,i):Ct(r,br(e,o,4),u,i,t)}}function hr(n,t,r,e,u,o,i,f,a,c){function l(){for(var m=arguments.length,x=m,j=De(m);x--;)j[x]=arguments[x];if(e&&(j=qt(j,e,u)),o&&(j=Kt(j,o,i)),_||y){var x=l.placeholder,k=v(j,x),m=m-k.length;if(m<c){var O=f?qn(f):w,m=ju(c-m,0),E=_?k:w,k=_?w:k,C=_?j:w,j=_?w:j;return t|=_?I:R,t&=~(_?R:I),
g||(t&=~(b|A)),j=[n,t,r,C,E,j,k,O,a,m],O=hr.apply(w,j),Fr(n)&&Zu(O,j),O.placeholder=x,O}}if(x=p?r:this,O=h?x[n]:n,f)for(m=j.length,E=ku(f.length,m),k=qn(j);E--;)C=f[E],j[E]=Ur(C,m)?k[C]:w;return s&&a<j.length&&(j.length=a),this&&this!==Yn&&this instanceof l&&(O=d||Ht(n)),O.apply(x,j)}var s=t&E,p=t&b,h=t&A,_=t&k,g=t&j,y=t&O,d=h?w:Ht(n);return l}function _r(n,t,r){return n=n.length,t=+t,n<t&&bu(t)?(t-=n,r=null==r?" ":r+"",$e(r,du(t/r.length)).slice(0,t)):""}function vr(n,t,r,e){function u(){for(var t=-1,f=arguments.length,a=-1,c=e.length,l=De(c+f);++a<c;)l[a]=e[a];
for(;f--;)l[a++]=arguments[++t];return(this&&this!==Yn&&this instanceof u?i:n).apply(o?r:this,l)}var o=t&b,i=Ht(n);return u}function gr(n){var t=Ve[n];return function(n,r){return(r=r===w?0:+r||0)?(r=su(10,r),t(n*r)/r):t(n)}}function yr(n){return function(t,r,e,u){var o=br(e);return null==e&&o===it?zt(t,r,n):Bt(t,r,o(e,u,1),n)}}function dr(n,t,r,e,u,o,i,f){var a=t&A;if(!a&&typeof n!="function")throw new Xe(T);var c=e?e.length:0;if(c||(t&=~(I|R),e=u=w),c-=u?u.length:0,t&R){var l=e,s=u;e=u=w}var p=a?w:Ku(n);
return r=[n,t,r,e,u,l,s,o,i,f],p&&(e=r[1],t=p[1],f=e|t,u=t==E&&e==k||t==E&&e==C&&r[7].length<=p[8]||t==(E|C)&&e==k,(f<E||u)&&(t&b&&(r[2]=p[2],f|=e&b?0:j),(e=p[3])&&(u=r[3],r[3]=u?qt(u,e,p[4]):qn(e),r[4]=u?v(r[3],P):qn(p[4])),(e=p[5])&&(u=r[5],r[5]=u?Kt(u,e,p[6]):qn(e),r[6]=u?v(r[5],P):qn(p[6])),(e=p[7])&&(r[7]=qn(e)),t&E&&(r[8]=null==r[8]?p[8]:ku(r[8],p[8])),null==r[9]&&(r[9]=p[9]),r[0]=p[0],r[1]=f),t=r[1],f=r[9]),r[9]=null==f?a?0:n.length:ju(f-c,0)||0,n=t==b?Jt(r[0],r[2]):t!=I&&t!=(b|I)||r[4].length?hr.apply(w,r):vr.apply(w,r),
(p?qu:Zu)(n,r)}function mr(n,t,r,e,u,o,i){var f=-1,a=n.length,c=t.length;if(a!=c&&(!u||c<=a))return false;for(;++f<a;){var l=n[f],c=t[f],s=e?e(u?c:l,u?l:c,f):w;if(s!==w){if(s)continue;return false}if(u){if(!nt(t,function(n){return l===n||r(l,n,e,u,o,i)}))return false}else if(l!==c&&!r(l,c,e,u,o,i))return false}return true}function wr(n,t,r){switch(r){case D:case M:return+n==+t;case q:return n.name==t.name&&n.message==t.message;case V:return n!=+n?t!=+t:n==+t;case Y:case G:return n==t+""}return false}function xr(n,t,r,e,u,o,i){
var f=Ko(n),a=f.length,c=Ko(t).length;if(a!=c&&!u)return false;for(c=a;c--;){var l=f[c];if(!(u?l in t:eu.call(t,l)))return false}for(var s=u;++c<a;){var l=f[c],p=n[l],h=t[l],_=e?e(u?h:p,u?p:h,l):w;if(_===w?!r(p,h,e,u,o,i):!_)return false;s||(s="constructor"==l)}return s||(r=n.constructor,e=t.constructor,!(r!=e&&"constructor"in n&&"constructor"in t)||typeof r=="function"&&r instanceof r&&typeof e=="function"&&e instanceof e)?true:false}function br(n,t,r){var e=Nn.callback||Le,e=e===Le?it:e;return r?e(n,t,r):e}function Ar(n){
for(var t=n.name+"",r=Fu[t],e=r?r.length:0;e--;){var u=r[e],o=u.func;if(null==o||o==n)return u.name}return t}function jr(n,t,e){var u=Nn.indexOf||Yr,u=u===Yr?r:u;return n?u(n,t,e):u}function kr(n){n=Ce(n);for(var t=n.length;t--;){var r,e=n[t];r=n[t][1],r=r===r&&!de(r),e[2]=r}return n}function Or(n,t){var r=null==n?w:n[t];return me(r)?r:w}function Ir(n){var t=n.length,r=new n.constructor(t);return t&&"string"==typeof n[0]&&eu.call(n,"index")&&(r.index=n.index,r.input=n.input),r}function Rr(n){return n=n.constructor,
typeof n=="function"&&n instanceof n||(n=Ye),new n}function Er(n,t,r){var e=n.constructor;switch(t){case J:return Mt(n);case D:case M:return new e(+n);case X:case H:case Q:case nn:case tn:case rn:case en:case un:case on:return e instanceof e&&(e=Lu[t]),t=n.buffer,new e(r?Mt(t):t,n.byteOffset,n.length);case V:case G:return new e(n);case Y:var u=new e(n.source,kn.exec(n));u.lastIndex=n.lastIndex}return u}function Cr(n,t,r){return null==n||Wr(t,n)||(t=Mr(t),n=1==t.length?n:mt(n,St(t,0,-1)),t=Gr(t)),
t=null==n?n:n[t],null==t?w:t.apply(n,r)}function Sr(n){return null!=n&&Lr(Vu(n))}function Ur(n,t){return n=typeof n=="number"||Rn.test(n)?+n:-1,t=null==t?$u:t,-1<n&&0==n%1&&n<t}function $r(n,t,r){if(!de(r))return false;var e=typeof t;return("number"==e?Sr(r)&&Ur(t,r.length):"string"==e&&t in r)?(t=r[t],n===n?n===t:t!==t):false}function Wr(n,t){var r=typeof n;return"string"==r&&dn.test(n)||"number"==r?true:Wo(n)?false:!yn.test(n)||null!=t&&n in Dr(t)}function Fr(n){var t=Ar(n),r=Nn[t];return typeof r=="function"&&t in zn.prototype?n===r?true:(t=Ku(r),
!!t&&n===t[0]):false}function Lr(n){return typeof n=="number"&&-1<n&&0==n%1&&n<=$u}function Nr(n,t){return n===w?t:Fo(n,t,Nr)}function Tr(n,t){n=Dr(n);for(var r=-1,e=t.length,u={};++r<e;){var o=t[r];o in n&&(u[o]=n[o])}return u}function Pr(n,t){var r={};return vt(n,function(n,e,u){t(n,e,u)&&(r[e]=n)}),r}function zr(n){for(var t=Ee(n),r=t.length,e=r&&n.length,u=!!e&&Lr(e)&&(Wo(n)||_e(n)||Ae(n)),o=-1,i=[];++o<r;){var f=t[o];(u&&Ur(f,e)||eu.call(n,f))&&i.push(f)}return i}function Br(n){return null==n?[]:Sr(n)?Nn.support.unindexedChars&&Ae(n)?n.split(""):de(n)?n:Ye(n):Se(n);
}function Dr(n){if(Nn.support.unindexedChars&&Ae(n)){for(var t=-1,r=n.length,e=Ye(n);++t<r;)e[t]=n.charAt(t);return e}return de(n)?n:Ye(n)}function Mr(n){if(Wo(n))return n;var t=[];return u(n).replace(mn,function(n,r,e,u){t.push(e?u.replace(An,"$1"):r||n)}),t}function qr(n){return n instanceof zn?n.clone():new Pn(n.__wrapped__,n.__chain__,qn(n.__actions__))}function Kr(n,t,r){return n&&n.length?((r?$r(n,t,r):null==t)&&(t=1),St(n,0>t?0:t)):[]}function Vr(n,t,r){var e=n?n.length:0;return e?((r?$r(n,t,r):null==t)&&(t=1),
t=e-(+t||0),St(n,0,0>t?0:t)):[]}function Zr(n){return n?n[0]:w}function Yr(n,t,e){var u=n?n.length:0;if(!u)return-1;if(typeof e=="number")e=0>e?ju(u+e,0):e;else if(e)return e=zt(n,t),e<u&&(t===t?t===n[e]:n[e]!==n[e])?e:-1;return r(n,t,e||0)}function Gr(n){var t=n?n.length:0;return t?n[t-1]:w}function Jr(n){return Kr(n,1)}function Xr(n,t,e,u){if(!n||!n.length)return[];null!=t&&typeof t!="boolean"&&(u=e,e=$r(n,t,u)?w:t,t=false);var o=br();if((null!=e||o!==it)&&(e=o(e,u,3)),t&&jr()===r){t=e;var i;e=-1,
u=n.length;for(var o=-1,f=[];++e<u;){var a=n[e],c=t?t(a,e,n):a;e&&i===c||(i=c,f[++o]=a)}n=f}else n=Lt(n,e);return n}function Hr(n){if(!n||!n.length)return[];var t=-1,r=0;n=Zn(n,function(n){return Sr(n)?(r=ju(n.length,r),true):void 0});for(var e=De(r);++t<r;)e[t]=Xn(n,Ot(t));return e}function Qr(n,t,r){return n&&n.length?(n=Hr(n),null==t?n:(t=Dt(t,r,4),Xn(n,function(n){return Qn(n,t,w,true)}))):[]}function ne(n,t){var r=-1,e=n?n.length:0,u={};for(!e||t||Wo(n[0])||(t=[]);++r<e;){var o=n[r];t?u[o]=t[r]:o&&(u[o[0]]=o[1]);
}return u}function te(n){return n=Nn(n),n.__chain__=true,n}function re(n,t,r){return t.call(r,n)}function ee(n,t,r){var e=Wo(n)?Vn:lt;return r&&$r(n,t,r)&&(t=w),(typeof t!="function"||r!==w)&&(t=br(t,r,3)),e(n,t)}function ue(n,t,r){var e=Wo(n)?Zn:pt;return t=br(t,r,3),e(n,t)}function oe(n,t,r,e){var u=n?Vu(n):0;return Lr(u)||(n=Se(n),u=n.length),r=typeof r!="number"||e&&$r(t,r,e)?0:0>r?ju(u+r,0):r||0,typeof n=="string"||!Wo(n)&&Ae(n)?r<=u&&-1<n.indexOf(t,r):!!u&&-1<jr(n,t,r)}function ie(n,t,r){var e=Wo(n)?Xn:bt;
return t=br(t,r,3),e(n,t)}function fe(n,t,r){if(r?$r(n,t,r):null==t){n=Br(n);var e=n.length;return 0<e?n[Et(0,e-1)]:w}r=-1,n=Oe(n);var e=n.length,u=e-1;for(t=ku(0>t?0:+t||0,e);++r<t;){var e=Et(r,u),o=n[e];n[e]=n[r],n[r]=o}return n.length=t,n}function ae(n,t,r){var e=Wo(n)?nt:Ut;return r&&$r(n,t,r)&&(t=w),(typeof t!="function"||r!==w)&&(t=br(t,r,3)),e(n,t)}function ce(n,t){var r;if(typeof t!="function"){if(typeof n!="function")throw new Xe(T);var e=n;n=t,t=e}return function(){return 0<--n&&(r=t.apply(this,arguments)),
1>=n&&(t=w),r}}function le(n,t,r){function e(t,r){r&&cu(r),a=p=h=w,t&&(_=wo(),c=n.apply(s,f),p||a||(f=s=w))}function u(){var n=t-(wo()-l);0>=n||n>t?e(h,a):p=_u(u,n)}function o(){e(g,p)}function i(){if(f=arguments,l=wo(),s=this,h=g&&(p||!y),false===v)var r=y&&!p;else{a||y||(_=l);var e=v-(l-_),i=0>=e||e>v;i?(a&&(a=cu(a)),_=l,c=n.apply(s,f)):a||(a=_u(o,e))}return i&&p?p=cu(p):p||t===v||(p=_u(u,t)),r&&(i=true,c=n.apply(s,f)),!i||p||a||(f=s=w),c}var f,a,c,l,s,p,h,_=0,v=false,g=true;if(typeof n!="function")throw new Xe(T);
if(t=0>t?0:+t||0,true===r)var y=true,g=false;else de(r)&&(y=!!r.leading,v="maxWait"in r&&ju(+r.maxWait||0,t),g="trailing"in r?!!r.trailing:g);return i.cancel=function(){p&&cu(p),a&&cu(a),_=0,a=p=h=w},i}function se(n,t){if(typeof n!="function"||t&&typeof t!="function")throw new Xe(T);var r=function(){var e=arguments,u=t?t.apply(this,e):e[0],o=r.cache;return o.has(u)?o.get(u):(e=n.apply(this,e),r.cache=o.set(u,e),e)};return r.cache=new se.Cache,r}function pe(n,t){if(typeof n!="function")throw new Xe(T);return t=ju(t===w?n.length-1:+t||0,0),
function(){for(var r=arguments,e=-1,u=ju(r.length-t,0),o=De(u);++e<u;)o[e]=r[t+e];switch(t){case 0:return n.call(this,o);case 1:return n.call(this,r[0],o);case 2:return n.call(this,r[0],r[1],o)}for(u=De(t+1),e=-1;++e<t;)u[e]=r[e];return u[t]=o,n.apply(this,u)}}function he(n,t){return n>t}function _e(n){return h(n)&&Sr(n)&&eu.call(n,"callee")&&!pu.call(n,"callee")}function ve(n,t,r,e){return e=(r=typeof r=="function"?Dt(r,e,3):w)?r(n,t):w,e===w?wt(n,t,r):!!e}function ge(n){return h(n)&&typeof n.message=="string"&&ou.call(n)==q;
}function ye(n){return de(n)&&ou.call(n)==K}function de(n){var t=typeof n;return!!n&&("object"==t||"function"==t)}function me(n){return null==n?false:ye(n)?fu.test(ru.call(n)):h(n)&&(Gn(n)?fu:In).test(n)}function we(n){return typeof n=="number"||h(n)&&ou.call(n)==V}function xe(n){var t;if(!h(n)||ou.call(n)!=Z||Gn(n)||_e(n)||!(eu.call(n,"constructor")||(t=n.constructor,typeof t!="function"||t instanceof t)))return false;var r;return Nn.support.ownLast?(vt(n,function(n,t,e){return r=eu.call(e,t),false}),false!==r):(vt(n,function(n,t){
r=t}),r===w||eu.call(n,r))}function be(n){return de(n)&&ou.call(n)==Y}function Ae(n){return typeof n=="string"||h(n)&&ou.call(n)==G}function je(n){return h(n)&&Lr(n.length)&&!!Fn[ou.call(n)]}function ke(n,t){return n<t}function Oe(n){var t=n?Vu(n):0;return Lr(t)?t?Nn.support.unindexedChars&&Ae(n)?n.split(""):qn(n):[]:Se(n)}function Ie(n){return ot(n,Ee(n))}function Re(n){return dt(n,Ee(n))}function Ee(n){if(null==n)return[];de(n)||(n=Ye(n));for(var t=n.length,r=Nn.support,t=t&&Lr(t)&&(Wo(n)||_e(n)||Ae(n))&&t||0,e=n.constructor,u=-1,e=ye(e)&&e.prototype||nu,o=e===n,i=De(t),f=0<t,a=r.enumErrorProps&&(n===Qe||n instanceof qe),c=r.enumPrototypes&&ye(n);++u<t;)i[u]=u+"";
for(var l in n)c&&"prototype"==l||a&&("message"==l||"name"==l)||f&&Ur(l,t)||"constructor"==l&&(o||!eu.call(n,l))||i.push(l);if(r.nonEnumShadows&&n!==nu)for(t=n===tu?G:n===Qe?q:ou.call(n),r=Nu[t]||Nu[Z],t==Z&&(e=nu),t=Wn.length;t--;)l=Wn[t],u=r[l],o&&u||(u?!eu.call(n,l):n[l]===e[l])||i.push(l);return i}function Ce(n){n=Dr(n);for(var t=-1,r=Ko(n),e=r.length,u=De(e);++t<e;){var o=r[t];u[t]=[o,n[o]]}return u}function Se(n){return Nt(n,Ko(n))}function Ue(n){return(n=u(n))&&n.replace(En,a).replace(bn,"");
}function $e(n,t){var r="";if(n=u(n),t=+t,1>t||!n||!bu(t))return r;do t%2&&(r+=n),t=wu(t/2),n+=n;while(t);return r}function We(n,t,r){var e=n;return(n=u(n))?(r?$r(e,t,r):null==t)?n.slice(g(n),y(n)+1):(t+="",n.slice(o(n,t),i(n,t)+1)):n}function Fe(n,t,r){return r&&$r(n,t,r)&&(t=w),n=u(n),n.match(t||Un)||[]}function Le(n,t,r){return r&&$r(n,t,r)&&(t=w),h(n)?Te(n):it(n,t)}function Ne(n){return n}function Te(n){return At(ft(n,true))}function Pe(n,t,r){if(null==r){var e=de(t),u=e?Ko(t):w;((u=u&&u.length?dt(t,u):w)?u.length:e)||(u=false,
r=t,t=n,n=this)}u||(u=dt(t,Ko(t)));var o=true,e=-1,i=ye(n),f=u.length;false===r?o=false:de(r)&&"chain"in r&&(o=r.chain);for(;++e<f;){r=u[e];var a=t[r];n[r]=a,i&&(n.prototype[r]=function(t){return function(){var r=this.__chain__;if(o||r){var e=n(this.__wrapped__);return(e.__actions__=qn(this.__actions__)).push({func:t,args:arguments,thisArg:n}),e.__chain__=r,e}return t.apply(n,Hn([this.value()],arguments))}}(a))}return n}function ze(){}function Be(n){return Wr(n)?Ot(n):It(n)}_=_?Jn.defaults(Yn.Object(),_,Jn.pick(Yn,$n)):Yn;
var De=_.Array,Me=_.Date,qe=_.Error,Ke=_.Function,Ve=_.Math,Ze=_.Number,Ye=_.Object,Ge=_.RegExp,Je=_.String,Xe=_.TypeError,He=De.prototype,Qe=qe.prototype,nu=Ye.prototype,tu=Je.prototype,ru=Ke.prototype.toString,eu=nu.hasOwnProperty,uu=0,ou=nu.toString,iu=Yn._,fu=Ge("^"+ru.call(eu).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),au=_.ArrayBuffer,cu=_.clearTimeout,lu=_.parseFloat,su=Ve.pow,pu=nu.propertyIsEnumerable,hu=Or(_,"Set"),_u=_.setTimeout,vu=He.splice,gu=_.Uint8Array,yu=Or(_,"WeakMap"),du=Ve.ceil,mu=Or(Ye,"create"),wu=Ve.floor,xu=Or(De,"isArray"),bu=_.isFinite,Au=Or(Ye,"keys"),ju=Ve.max,ku=Ve.min,Ou=Or(Me,"now"),Iu=_.parseInt,Ru=Ve.random,Eu=Ze.NEGATIVE_INFINITY,Cu=Ze.POSITIVE_INFINITY,Su=4294967294,Uu=2147483647,$u=9007199254740991,Wu=yu&&new yu,Fu={},Lu={};
Lu[X]=_.Float32Array,Lu[H]=_.Float64Array,Lu[Q]=_.Int8Array,Lu[nn]=_.Int16Array,Lu[tn]=_.Int32Array,Lu[rn]=gu,Lu[en]=_.Uint8ClampedArray,Lu[un]=_.Uint16Array,Lu[on]=_.Uint32Array;var Nu={};Nu[B]=Nu[M]=Nu[V]={constructor:true,toLocaleString:true,toString:true,valueOf:true},Nu[D]=Nu[G]={constructor:true,toString:true,valueOf:true},Nu[q]=Nu[K]=Nu[Y]={constructor:true,toString:true},Nu[Z]={constructor:true},Kn(Wn,function(n){for(var t in Nu)if(eu.call(Nu,t)){var r=Nu[t];r[n]=eu.call(r,n)}});var Tu=Nn.support={};!function(n){
var t=function(){this.x=n},r={0:n,length:n},e=[];t.prototype={valueOf:n,y:n};for(var u in new t)e.push(u);Tu.enumErrorProps=pu.call(Qe,"message")||pu.call(Qe,"name"),Tu.enumPrototypes=pu.call(t,"prototype"),Tu.nonEnumShadows=!/valueOf/.test(e),Tu.ownLast="x"!=e[0],Tu.spliceObjects=(vu.call(r,0,1),!r[0]),Tu.unindexedChars="xx"!="x"[0]+Ye("x")[0]}(1,0),Nn.templateSettings={escape:_n,evaluate:vn,interpolate:gn,variable:"",imports:{_:Nn}};var Pu=function(){function n(){}return function(t){if(de(t)){n.prototype=t;
var r=new n;n.prototype=w}return r||{}}}(),zu=Yt(gt),Bu=Yt(yt,true),Du=Gt(),Mu=Gt(true),qu=Wu?function(n,t){return Wu.set(n,t),n}:Ne,Ku=Wu?function(n){return Wu.get(n)}:ze,Vu=Ot("length"),Zu=function(){var n=0,t=0;return function(r,e){var u=wo(),o=W-(u-t);if(t=u,0<o){if(++n>=$)return r}else n=0;return qu(r,e)}}(),Yu=pe(function(n,t){return h(n)&&Sr(n)?ct(n,_t(t,false,true)):[]}),Gu=er(),Ju=er(true),Xu=pe(function(n){for(var t=n.length,e=t,u=De(l),o=jr(),i=o===r,f=[];e--;){var a=n[e]=Sr(a=n[e])?a:[];u[e]=i&&120<=a.length&&mu&&hu?new Dn(e&&a):null;
}var i=n[0],c=-1,l=i?i.length:0,s=u[0];n:for(;++c<l;)if(a=i[c],0>(s?Mn(s,a):o(f,a,0))){for(e=t;--e;){var p=u[e];if(0>(p?Mn(p,a):o(n[e],a,0)))continue n}s&&s.push(a),f.push(a)}return f}),Hu=pe(function(t,r){r=_t(r);var e=ut(t,r);return Rt(t,r.sort(n)),e}),Qu=yr(),no=yr(true),to=pe(function(n){return Lt(_t(n,false,true))}),ro=pe(function(n,t){return Sr(n)?ct(n,t):[]}),eo=pe(Hr),uo=pe(function(n){var t=n.length,r=2<t?n[t-2]:w,e=1<t?n[t-1]:w;return 2<t&&typeof r=="function"?t-=2:(r=1<t&&typeof e=="function"?(--t,
e):w,e=w),n.length=t,Qr(n,r,e)}),oo=pe(function(n){return n=_t(n),this.thru(function(t){t=Wo(t)?t:[Dr(t)];for(var r=n,e=-1,u=t.length,o=-1,i=r.length,f=De(u+i);++e<u;)f[e]=t[e];for(;++o<i;)f[e++]=r[o];return f})}),io=pe(function(n,t){return Sr(n)&&(n=Br(n)),ut(n,_t(t))}),fo=Vt(function(n,t,r){eu.call(n,r)?++n[r]:n[r]=1}),ao=rr(zu),co=rr(Bu,true),lo=ir(Kn,zu),so=ir(function(n,t){for(var r=n.length;r--&&false!==t(n[r],r,n););return n},Bu),po=Vt(function(n,t,r){eu.call(n,r)?n[r].push(t):n[r]=[t]}),ho=Vt(function(n,t,r){
n[r]=t}),_o=pe(function(n,t,r){var e=-1,u=typeof t=="function",o=Wr(t),i=Sr(n)?De(n.length):[];return zu(n,function(n){var f=u?t:o&&null!=n?n[t]:w;i[++e]=f?f.apply(n,r):Cr(n,t,r)}),i}),vo=Vt(function(n,t,r){n[r?0:1].push(t)},function(){return[[],[]]}),go=pr(Qn,zu),yo=pr(function(n,t,r,e){var u=n.length;for(e&&u&&(r=n[--u]);u--;)r=t(r,n[u],u,n);return r},Bu),mo=pe(function(n,t){if(null==n)return[];var r=t[2];return r&&$r(t[0],t[1],r)&&(t.length=1),Wt(n,_t(t),[])}),wo=Ou||function(){return(new Me).getTime();
},xo=pe(function(n,t,r){var e=b;if(r.length)var u=v(r,xo.placeholder),e=e|I;return dr(n,e,t,r,u)}),bo=pe(function(n,t){t=t.length?_t(t):Re(n);for(var r=-1,e=t.length;++r<e;){var u=t[r];n[u]=dr(n[u],b,n)}return n}),Ao=pe(function(n,t,r){var e=b|A;if(r.length)var u=v(r,Ao.placeholder),e=e|I;return dr(t,e,n,r,u)}),jo=Qt(k),ko=Qt(O),Oo=pe(function(n,t){return at(n,1,t)}),Io=pe(function(n,t,r){return at(n,t,r)}),Ro=or(),Eo=or(true),Co=pe(function(n,t){if(t=_t(t),typeof n!="function"||!Vn(t,e))throw new Xe(T);
var r=t.length;return pe(function(e){for(var u=ku(e.length,r);u--;)e[u]=t[u](e[u]);return n.apply(this,e)})}),So=sr(I),Uo=sr(R),$o=pe(function(n,t){return dr(n,C,w,w,w,_t(t))}),Wo=xu||function(n){return h(n)&&Lr(n.length)&&ou.call(n)==B},Fo=Zt(kt),Lo=Zt(function(n,t,r){return r?rt(n,t,r):et(n,t)}),No=nr(Lo,function(n,t){return n===w?t:n}),To=nr(Fo,Nr),Po=ur(gt),zo=ur(yt),Bo=fr(Du),Do=fr(Mu),Mo=ar(gt),qo=ar(yt),Ko=Au?function(n){var t=null==n?w:n.constructor;return typeof t=="function"&&t.prototype===n||(typeof n=="function"?Nn.support.enumPrototypes:Sr(n))?zr(n):de(n)?Au(n):[];
}:zr,Vo=cr(true),Zo=cr(),Yo=pe(function(n,t){if(null==n)return{};if("function"!=typeof t[0])return t=Xn(_t(t),Je),Tr(n,ct(Ee(n),t));var r=Dt(t[0],t[1],3);return Pr(n,function(n,t,e){return!r(n,t,e)})}),Go=pe(function(n,t){return null==n?{}:"function"==typeof t[0]?Pr(n,Dt(t[0],t[1],3)):Tr(n,_t(t))}),Jo=Xt(function(n,t,r){return t=t.toLowerCase(),n+(r?t.charAt(0).toUpperCase()+t.slice(1):t)}),Xo=Xt(function(n,t,r){return n+(r?"-":"")+t.toLowerCase()}),Ho=lr(),Qo=lr(true),ni=Xt(function(n,t,r){return n+(r?"_":"")+t.toLowerCase();
}),ti=Xt(function(n,t,r){return n+(r?" ":"")+(t.charAt(0).toUpperCase()+t.slice(1))}),ri=pe(function(n,t){try{return n.apply(w,t)}catch(r){return ge(r)?r:new qe(r)}}),ei=pe(function(n,t){return function(r){return Cr(r,n,t)}}),ui=pe(function(n,t){return function(r){return Cr(n,r,t)}}),oi=gr("ceil"),ii=gr("floor"),fi=tr(he,Eu),ai=tr(ke,Cu),ci=gr("round");return Nn.prototype=Tn.prototype,Pn.prototype=Pu(Tn.prototype),Pn.prototype.constructor=Pn,zn.prototype=Pu(Tn.prototype),zn.prototype.constructor=zn,
Bn.prototype["delete"]=function(n){return this.has(n)&&delete this.__data__[n]},Bn.prototype.get=function(n){return"__proto__"==n?w:this.__data__[n]},Bn.prototype.has=function(n){return"__proto__"!=n&&eu.call(this.__data__,n)},Bn.prototype.set=function(n,t){return"__proto__"!=n&&(this.__data__[n]=t),this},Dn.prototype.push=function(n){var t=this.data;typeof n=="string"||de(n)?t.set.add(n):t.hash[n]=true},se.Cache=Bn,Nn.after=function(n,t){if(typeof t!="function"){if(typeof n!="function")throw new Xe(T);
var r=n;n=t,t=r}return n=bu(n=+n)?n:0,function(){return 1>--n?t.apply(this,arguments):void 0}},Nn.ary=function(n,t,r){return r&&$r(n,t,r)&&(t=w),t=n&&null==t?n.length:ju(+t||0,0),dr(n,E,w,w,w,w,t)},Nn.assign=Lo,Nn.at=io,Nn.before=ce,Nn.bind=xo,Nn.bindAll=bo,Nn.bindKey=Ao,Nn.callback=Le,Nn.chain=te,Nn.chunk=function(n,t,r){t=(r?$r(n,t,r):null==t)?1:ju(wu(t)||1,1),r=0;for(var e=n?n.length:0,u=-1,o=De(du(e/t));r<e;)o[++u]=St(n,r,r+=t);return o},Nn.compact=function(n){for(var t=-1,r=n?n.length:0,e=-1,u=[];++t<r;){
var o=n[t];o&&(u[++e]=o)}return u},Nn.constant=function(n){return function(){return n}},Nn.countBy=fo,Nn.create=function(n,t,r){var e=Pu(n);return r&&$r(n,t,r)&&(t=w),t?et(e,t):e},Nn.curry=jo,Nn.curryRight=ko,Nn.debounce=le,Nn.defaults=No,Nn.defaultsDeep=To,Nn.defer=Oo,Nn.delay=Io,Nn.difference=Yu,Nn.drop=Kr,Nn.dropRight=Vr,Nn.dropRightWhile=function(n,t,r){return n&&n.length?Tt(n,br(t,r,3),true,true):[]},Nn.dropWhile=function(n,t,r){return n&&n.length?Tt(n,br(t,r,3),true):[]},Nn.fill=function(n,t,r,e){
var u=n?n.length:0;if(!u)return[];for(r&&typeof r!="number"&&$r(n,t,r)&&(r=0,e=u),u=n.length,r=null==r?0:+r||0,0>r&&(r=-r>u?0:u+r),e=e===w||e>u?u:+e||0,0>e&&(e+=u),u=r>e?0:e>>>0,r>>>=0;r<u;)n[r++]=t;return n},Nn.filter=ue,Nn.flatten=function(n,t,r){var e=n?n.length:0;return r&&$r(n,t,r)&&(t=false),e?_t(n,t):[]},Nn.flattenDeep=function(n){return n&&n.length?_t(n,true):[]},Nn.flow=Ro,Nn.flowRight=Eo,Nn.forEach=lo,Nn.forEachRight=so,Nn.forIn=Bo,Nn.forInRight=Do,Nn.forOwn=Mo,Nn.forOwnRight=qo,Nn.functions=Re,
Nn.groupBy=po,Nn.indexBy=ho,Nn.initial=function(n){return Vr(n,1)},Nn.intersection=Xu,Nn.invert=function(n,t,r){r&&$r(n,t,r)&&(t=w),r=-1;for(var e=Ko(n),u=e.length,o={};++r<u;){var i=e[r],f=n[i];t?eu.call(o,f)?o[f].push(i):o[f]=[i]:o[f]=i}return o},Nn.invoke=_o,Nn.keys=Ko,Nn.keysIn=Ee,Nn.map=ie,Nn.mapKeys=Vo,Nn.mapValues=Zo,Nn.matches=Te,Nn.matchesProperty=function(n,t){return jt(n,ft(t,true))},Nn.memoize=se,Nn.merge=Fo,Nn.method=ei,Nn.methodOf=ui,Nn.mixin=Pe,Nn.modArgs=Co,Nn.negate=function(n){if(typeof n!="function")throw new Xe(T);
return function(){return!n.apply(this,arguments)}},Nn.omit=Yo,Nn.once=function(n){return ce(2,n)},Nn.pairs=Ce,Nn.partial=So,Nn.partialRight=Uo,Nn.partition=vo,Nn.pick=Go,Nn.pluck=function(n,t){return ie(n,Be(t))},Nn.property=Be,Nn.propertyOf=function(n){return function(t){return mt(n,Mr(t),t+"")}},Nn.pull=function(){var n=arguments,t=n[0];if(!t||!t.length)return t;for(var r=0,e=jr(),u=n.length;++r<u;)for(var o=0,i=n[r];-1<(o=e(t,i,o));)vu.call(t,o,1);return t},Nn.pullAt=Hu,Nn.range=function(n,t,r){
r&&$r(n,t,r)&&(t=r=w),n=+n||0,r=null==r?1:+r||0,null==t?(t=n,n=0):t=+t||0;var e=-1;t=ju(du((t-n)/(r||1)),0);for(var u=De(t);++e<t;)u[e]=n,n+=r;return u},Nn.rearg=$o,Nn.reject=function(n,t,r){var e=Wo(n)?Zn:pt;return t=br(t,r,3),e(n,function(n,r,e){return!t(n,r,e)})},Nn.remove=function(n,t,r){var e=[];if(!n||!n.length)return e;var u=-1,o=[],i=n.length;for(t=br(t,r,3);++u<i;)r=n[u],t(r,u,n)&&(e.push(r),o.push(u));return Rt(n,o),e},Nn.rest=Jr,Nn.restParam=pe,Nn.set=function(n,t,r){if(null==n)return n;
var e=t+"";t=null!=n[e]||Wr(t,n)?[e]:Mr(t);for(var e=-1,u=t.length,o=u-1,i=n;null!=i&&++e<u;){var f=t[e];de(i)&&(e==o?i[f]=r:null==i[f]&&(i[f]=Ur(t[e+1])?[]:{})),i=i[f]}return n},Nn.shuffle=function(n){return fe(n,Cu)},Nn.slice=function(n,t,r){var e=n?n.length:0;return e?(r&&typeof r!="number"&&$r(n,t,r)&&(t=0,r=e),St(n,t,r)):[]},Nn.sortBy=function(n,t,r){if(null==n)return[];r&&$r(n,t,r)&&(t=w);var e=-1;return t=br(t,r,3),n=bt(n,function(n,r,u){return{a:t(n,r,u),b:++e,c:n}}),$t(n,f)},Nn.sortByAll=mo,
Nn.sortByOrder=function(n,t,r,e){return null==n?[]:(e&&$r(t,r,e)&&(r=w),Wo(t)||(t=null==t?[]:[t]),Wo(r)||(r=null==r?[]:[r]),Wt(n,t,r))},Nn.spread=function(n){if(typeof n!="function")throw new Xe(T);return function(t){return n.apply(this,t)}},Nn.take=function(n,t,r){return n&&n.length?((r?$r(n,t,r):null==t)&&(t=1),St(n,0,0>t?0:t)):[]},Nn.takeRight=function(n,t,r){var e=n?n.length:0;return e?((r?$r(n,t,r):null==t)&&(t=1),t=e-(+t||0),St(n,0>t?0:t)):[]},Nn.takeRightWhile=function(n,t,r){return n&&n.length?Tt(n,br(t,r,3),false,true):[];
},Nn.takeWhile=function(n,t,r){return n&&n.length?Tt(n,br(t,r,3)):[]},Nn.tap=function(n,t,r){return t.call(r,n),n},Nn.throttle=function(n,t,r){var e=true,u=true;if(typeof n!="function")throw new Xe(T);return false===r?e=false:de(r)&&(e="leading"in r?!!r.leading:e,u="trailing"in r?!!r.trailing:u),le(n,t,{leading:e,maxWait:+t,trailing:u})},Nn.thru=re,Nn.times=function(n,t,r){if(n=wu(n),1>n||!bu(n))return[];var e=-1,u=De(ku(n,4294967295));for(t=Dt(t,r,1);++e<n;)4294967295>e?u[e]=t(e):t(e);return u},Nn.toArray=Oe,
Nn.toPlainObject=Ie,Nn.transform=function(n,t,r,e){var u=Wo(n)||je(n);return t=br(t,e,4),null==r&&(u||de(n)?(e=n.constructor,r=u?Wo(n)?new e:[]:Pu(ye(e)?e.prototype:w)):r={}),(u?Kn:gt)(n,function(n,e,u){return t(r,n,e,u)}),r},Nn.union=to,Nn.uniq=Xr,Nn.unzip=Hr,Nn.unzipWith=Qr,Nn.values=Se,Nn.valuesIn=function(n){return Nt(n,Ee(n))},Nn.where=function(n,t){return ue(n,At(t))},Nn.without=ro,Nn.wrap=function(n,t){return t=null==t?Ne:t,dr(t,I,w,[n],[])},Nn.xor=function(){for(var n=-1,t=arguments.length;++n<t;){
var r=arguments[n];if(Sr(r))var e=e?Hn(ct(e,r),ct(r,e)):r}return e?Lt(e):[]},Nn.zip=eo,Nn.zipObject=ne,Nn.zipWith=uo,Nn.backflow=Eo,Nn.collect=ie,Nn.compose=Eo,Nn.each=lo,Nn.eachRight=so,Nn.extend=Lo,Nn.iteratee=Le,Nn.methods=Re,Nn.object=ne,Nn.select=ue,Nn.tail=Jr,Nn.unique=Xr,Pe(Nn,Nn),Nn.add=function(n,t){return(+n||0)+(+t||0)},Nn.attempt=ri,Nn.camelCase=Jo,Nn.capitalize=function(n){return(n=u(n))&&n.charAt(0).toUpperCase()+n.slice(1)},Nn.ceil=oi,Nn.clone=function(n,t,r,e){return t&&typeof t!="boolean"&&$r(n,t,r)?t=false:typeof t=="function"&&(e=r,
r=t,t=false),typeof r=="function"?ft(n,t,Dt(r,e,3)):ft(n,t)},Nn.cloneDeep=function(n,t,r){return typeof t=="function"?ft(n,true,Dt(t,r,3)):ft(n,true)},Nn.deburr=Ue,Nn.endsWith=function(n,t,r){n=u(n),t+="";var e=n.length;return r=r===w?e:ku(0>r?0:+r||0,e),r-=t.length,0<=r&&n.indexOf(t,r)==r},Nn.escape=function(n){return(n=u(n))&&hn.test(n)?n.replace(sn,c):n},Nn.escapeRegExp=function(n){return(n=u(n))&&xn.test(n)?n.replace(wn,l):n||"(?:)"},Nn.every=ee,Nn.find=ao,Nn.findIndex=Gu,Nn.findKey=Po,Nn.findLast=co,
Nn.findLastIndex=Ju,Nn.findLastKey=zo,Nn.findWhere=function(n,t){return ao(n,At(t))},Nn.first=Zr,Nn.floor=ii,Nn.get=function(n,t,r){return n=null==n?w:mt(n,Mr(t),t+""),n===w?r:n},Nn.gt=he,Nn.gte=function(n,t){return n>=t},Nn.has=function(n,t){if(null==n)return false;var r=eu.call(n,t);if(!r&&!Wr(t)){if(t=Mr(t),n=1==t.length?n:mt(n,St(t,0,-1)),null==n)return false;t=Gr(t),r=eu.call(n,t)}return r||Lr(n.length)&&Ur(t,n.length)&&(Wo(n)||_e(n)||Ae(n))},Nn.identity=Ne,Nn.includes=oe,Nn.indexOf=Yr,Nn.inRange=function(n,t,r){
return t=+t||0,r===w?(r=t,t=0):r=+r||0,n>=ku(t,r)&&n<ju(t,r)},Nn.isArguments=_e,Nn.isArray=Wo,Nn.isBoolean=function(n){return true===n||false===n||h(n)&&ou.call(n)==D},Nn.isDate=function(n){return h(n)&&ou.call(n)==M},Nn.isElement=function(n){return!!n&&1===n.nodeType&&h(n)&&!xe(n)},Nn.isEmpty=function(n){return null==n?true:Sr(n)&&(Wo(n)||Ae(n)||_e(n)||h(n)&&ye(n.splice))?!n.length:!Ko(n).length},Nn.isEqual=ve,Nn.isError=ge,Nn.isFinite=function(n){return typeof n=="number"&&bu(n)},Nn.isFunction=ye,Nn.isMatch=function(n,t,r,e){
return r=typeof r=="function"?Dt(r,e,3):w,xt(n,kr(t),r)},Nn.isNaN=function(n){return we(n)&&n!=+n},Nn.isNative=me,Nn.isNull=function(n){return null===n},Nn.isNumber=we,Nn.isObject=de,Nn.isPlainObject=xe,Nn.isRegExp=be,Nn.isString=Ae,Nn.isTypedArray=je,Nn.isUndefined=function(n){return n===w},Nn.kebabCase=Xo,Nn.last=Gr,Nn.lastIndexOf=function(n,t,r){var e=n?n.length:0;if(!e)return-1;var u=e;if(typeof r=="number")u=(0>r?ju(e+r,0):ku(r||0,e-1))+1;else if(r)return u=zt(n,t,true)-1,n=n[u],(t===t?t===n:n!==n)?u:-1;
if(t!==t)return p(n,u,true);for(;u--;)if(n[u]===t)return u;return-1},Nn.lt=ke,Nn.lte=function(n,t){return n<=t},Nn.max=fi,Nn.min=ai,Nn.noConflict=function(){return Yn._=iu,this},Nn.noop=ze,Nn.now=wo,Nn.pad=function(n,t,r){n=u(n),t=+t;var e=n.length;return e<t&&bu(t)?(e=(t-e)/2,t=wu(e),e=du(e),r=_r("",e,r),r.slice(0,t)+n+r):n},Nn.padLeft=Ho,Nn.padRight=Qo,Nn.parseInt=function(n,t,r){return(r?$r(n,t,r):null==t)?t=0:t&&(t=+t),n=We(n),Iu(n,t||(On.test(n)?16:10))},Nn.random=function(n,t,r){r&&$r(n,t,r)&&(t=r=w);
var e=null==n,u=null==t;return null==r&&(u&&typeof n=="boolean"?(r=n,n=1):typeof t=="boolean"&&(r=t,u=true)),e&&u&&(t=1,u=false),n=+n||0,u?(t=n,n=0):t=+t||0,r||n%1||t%1?(r=Ru(),ku(n+r*(t-n+lu("1e-"+((r+"").length-1))),t)):Et(n,t)},Nn.reduce=go,Nn.reduceRight=yo,Nn.repeat=$e,Nn.result=function(n,t,r){var e=null==n?w:Dr(n)[t];return e===w&&(null==n||Wr(t,n)||(t=Mr(t),n=1==t.length?n:mt(n,St(t,0,-1)),e=null==n?w:Dr(n)[Gr(t)]),e=e===w?r:e),ye(e)?e.call(n):e},Nn.round=ci,Nn.runInContext=m,Nn.size=function(n){
var t=n?Vu(n):0;return Lr(t)?t:Ko(n).length},Nn.snakeCase=ni,Nn.some=ae,Nn.sortedIndex=Qu,Nn.sortedLastIndex=no,Nn.startCase=ti,Nn.startsWith=function(n,t,r){return n=u(n),r=null==r?0:ku(0>r?0:+r||0,n.length),n.lastIndexOf(t,r)==r},Nn.sum=function(n,t,r){if(r&&$r(n,t,r)&&(t=w),t=br(t,r,3),1==t.length){n=Wo(n)?n:Br(n),r=n.length;for(var e=0;r--;)e+=+t(n[r])||0;n=e}else n=Ft(n,t);return n},Nn.template=function(n,t,r){var e=Nn.templateSettings;r&&$r(n,t,r)&&(t=r=w),n=u(n),t=rt(et({},r||t),e,tt),r=rt(et({},t.imports),e.imports,tt);
var o,i,f=Ko(r),a=Nt(r,f),c=0;r=t.interpolate||Cn;var l="__p+='";r=Ge((t.escape||Cn).source+"|"+r.source+"|"+(r===gn?jn:Cn).source+"|"+(t.evaluate||Cn).source+"|$","g");var p="sourceURL"in t?"//# sourceURL="+t.sourceURL+"\n":"";if(n.replace(r,function(t,r,e,u,f,a){return e||(e=u),l+=n.slice(c,a).replace(Sn,s),r&&(o=true,l+="'+__e("+r+")+'"),f&&(i=true,l+="';"+f+";\n__p+='"),e&&(l+="'+((__t=("+e+"))==null?'':__t)+'"),c=a+t.length,t}),l+="';",(t=t.variable)||(l="with(obj){"+l+"}"),l=(i?l.replace(fn,""):l).replace(an,"$1").replace(cn,"$1;"),
l="function("+(t||"obj")+"){"+(t?"":"obj||(obj={});")+"var __t,__p=''"+(o?",__e=_.escape":"")+(i?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":";")+l+"return __p}",t=ri(function(){return Ke(f,p+"return "+l).apply(w,a)}),t.source=l,ge(t))throw t;return t},Nn.trim=We,Nn.trimLeft=function(n,t,r){var e=n;return(n=u(n))?n.slice((r?$r(e,t,r):null==t)?g(n):o(n,t+"")):n},Nn.trimRight=function(n,t,r){var e=n;return(n=u(n))?(r?$r(e,t,r):null==t)?n.slice(0,y(n)+1):n.slice(0,i(n,t+"")+1):n;
},Nn.trunc=function(n,t,r){r&&$r(n,t,r)&&(t=w);var e=S;if(r=U,null!=t)if(de(t)){var o="separator"in t?t.separator:o,e="length"in t?+t.length||0:e;r="omission"in t?u(t.omission):r}else e=+t||0;if(n=u(n),e>=n.length)return n;if(e-=r.length,1>e)return r;if(t=n.slice(0,e),null==o)return t+r;if(be(o)){if(n.slice(e).search(o)){var i,f=n.slice(0,e);for(o.global||(o=Ge(o.source,(kn.exec(o)||"")+"g")),o.lastIndex=0;n=o.exec(f);)i=n.index;t=t.slice(0,null==i?e:i)}}else n.indexOf(o,e)!=e&&(o=t.lastIndexOf(o),
-1<o&&(t=t.slice(0,o)));return t+r},Nn.unescape=function(n){return(n=u(n))&&pn.test(n)?n.replace(ln,d):n},Nn.uniqueId=function(n){var t=++uu;return u(n)+t},Nn.words=Fe,Nn.all=ee,Nn.any=ae,Nn.contains=oe,Nn.eq=ve,Nn.detect=ao,Nn.foldl=go,Nn.foldr=yo,Nn.head=Zr,Nn.include=oe,Nn.inject=go,Pe(Nn,function(){var n={};return gt(Nn,function(t,r){Nn.prototype[r]||(n[r]=t)}),n}(),false),Nn.sample=fe,Nn.prototype.sample=function(n){return this.__chain__||null!=n?this.thru(function(t){return fe(t,n)}):fe(this.value());
},Nn.VERSION=x,Kn("bind bindKey curry curryRight partial partialRight".split(" "),function(n){Nn[n].placeholder=Nn}),Kn(["drop","take"],function(n,t){zn.prototype[n]=function(r){var e=this.__filtered__;if(e&&!t)return new zn(this);r=null==r?1:ju(wu(r)||0,0);var u=this.clone();return e?u.__takeCount__=ku(u.__takeCount__,r):u.__views__.push({size:r,type:n+(0>u.__dir__?"Right":"")}),u},zn.prototype[n+"Right"]=function(t){return this.reverse()[n](t).reverse()}}),Kn(["filter","map","takeWhile"],function(n,t){
var r=t+1,e=r!=N;zn.prototype[n]=function(n,t){var u=this.clone();return u.__iteratees__.push({iteratee:br(n,t,1),type:r}),u.__filtered__=u.__filtered__||e,u}}),Kn(["first","last"],function(n,t){var r="take"+(t?"Right":"");zn.prototype[n]=function(){return this[r](1).value()[0]}}),Kn(["initial","rest"],function(n,t){var r="drop"+(t?"":"Right");zn.prototype[n]=function(){return this.__filtered__?new zn(this):this[r](1)}}),Kn(["pluck","where"],function(n,t){var r=t?"filter":"map",e=t?At:Be;zn.prototype[n]=function(n){
return this[r](e(n))}}),zn.prototype.compact=function(){return this.filter(Ne)},zn.prototype.reject=function(n,t){return n=br(n,t,1),this.filter(function(t){return!n(t)})},zn.prototype.slice=function(n,t){n=null==n?0:+n||0;var r=this;return r.__filtered__&&(0<n||0>t)?new zn(r):(0>n?r=r.takeRight(-n):n&&(r=r.drop(n)),t!==w&&(t=+t||0,r=0>t?r.dropRight(-t):r.take(t-n)),r)},zn.prototype.takeRightWhile=function(n,t){return this.reverse().takeWhile(n,t).reverse()},zn.prototype.toArray=function(){return this.take(Cu);
},gt(zn.prototype,function(n,t){var r=/^(?:filter|map|reject)|While$/.test(t),e=/^(?:first|last)$/.test(t),u=Nn[e?"take"+("last"==t?"Right":""):t];u&&(Nn.prototype[t]=function(){var t=e?[1]:arguments,o=this.__chain__,i=this.__wrapped__,f=!!this.__actions__.length,a=i instanceof zn,c=t[0],l=a||Wo(i);l&&r&&typeof c=="function"&&1!=c.length&&(a=l=false);var s=function(n){return e&&o?u(n,1)[0]:u.apply(w,Hn([n],t))},c={func:re,args:[s],thisArg:w},f=a&&!f;return e&&!o?f?(i=i.clone(),i.__actions__.push(c),
n.call(i)):u.call(w,this.value())[0]:!e&&l?(i=f?i:new zn(this),i=n.apply(i,t),i.__actions__.push(c),new Pn(i,o)):this.thru(s)})}),Kn("join pop push replace shift sort splice split unshift".split(" "),function(n){var t=(/^(?:replace|split)$/.test(n)?tu:He)[n],r=/^(?:push|sort|unshift)$/.test(n)?"tap":"thru",e=!Tu.spliceObjects&&/^(?:pop|shift|splice)$/.test(n),u=/^(?:join|pop|replace|shift)$/.test(n),o=e?function(){var n=t.apply(this,arguments);return 0===this.length&&delete this[0],n}:t;Nn.prototype[n]=function(){
var n=arguments;return u&&!this.__chain__?o.apply(this.value(),n):this[r](function(t){return o.apply(t,n)})}}),gt(zn.prototype,function(n,t){var r=Nn[t];if(r){var e=r.name+"";(Fu[e]||(Fu[e]=[])).push({name:t,func:r})}}),Fu[hr(w,A).name]=[{name:"wrapper",func:w}],zn.prototype.clone=function(){var n=new zn(this.__wrapped__);return n.__actions__=qn(this.__actions__),n.__dir__=this.__dir__,n.__filtered__=this.__filtered__,n.__iteratees__=qn(this.__iteratees__),n.__takeCount__=this.__takeCount__,n.__views__=qn(this.__views__),
n},zn.prototype.reverse=function(){if(this.__filtered__){var n=new zn(this);n.__dir__=-1,n.__filtered__=true}else n=this.clone(),n.__dir__*=-1;return n},zn.prototype.value=function(){var n,t=this.__wrapped__.value(),r=this.__dir__,e=Wo(t),u=0>r,o=e?t.length:0;n=0;for(var i=o,f=this.__views__,a=-1,c=f.length;++a<c;){var l=f[a],s=l.size;switch(l.type){case"drop":n+=s;break;case"dropRight":i-=s;break;case"take":i=ku(i,n+s);break;case"takeRight":n=ju(n,i-s)}}if(n={start:n,end:i},i=n.start,f=n.end,n=f-i,
u=u?f:i-1,i=this.__iteratees__,f=i.length,a=0,c=ku(n,this.__takeCount__),!e||o<F||o==n&&c==n)return Pt(t,this.__actions__);e=[];n:for(;n--&&a<c;){for(u+=r,o=-1,l=t[u];++o<f;){var p=i[o],s=p.type,p=p.iteratee(l);if(s==N)l=p;else if(!p){if(s==L)continue n;break n}}e[a++]=l}return e},Nn.prototype.chain=function(){return te(this)},Nn.prototype.commit=function(){return new Pn(this.value(),this.__chain__)},Nn.prototype.concat=oo,Nn.prototype.plant=function(n){for(var t,r=this;r instanceof Tn;){var e=qr(r);
t?u.__wrapped__=e:t=e;var u=e,r=r.__wrapped__}return u.__wrapped__=n,t},Nn.prototype.reverse=function(){var n=this.__wrapped__,t=function(n){return n.reverse()};return n instanceof zn?(this.__actions__.length&&(n=new zn(this)),n=n.reverse(),n.__actions__.push({func:re,args:[t],thisArg:w}),new Pn(n,this.__chain__)):this.thru(t)},Nn.prototype.toString=function(){return this.value()+""},Nn.prototype.run=Nn.prototype.toJSON=Nn.prototype.valueOf=Nn.prototype.value=function(){return Pt(this.__wrapped__,this.__actions__);
},Nn.prototype.collect=Nn.prototype.map,Nn.prototype.head=Nn.prototype.first,Nn.prototype.select=Nn.prototype.filter,Nn.prototype.tail=Nn.prototype.rest,Nn}var w,x="3.10.1",b=1,A=2,j=4,k=8,O=16,I=32,R=64,E=128,C=256,S=30,U="...",$=150,W=16,F=200,L=1,N=2,T="Expected a function",P="__lodash_placeholder__",z="[object Arguments]",B="[object Array]",D="[object Boolean]",M="[object Date]",q="[object Error]",K="[object Function]",V="[object Number]",Z="[object Object]",Y="[object RegExp]",G="[object String]",J="[object ArrayBuffer]",X="[object Float32Array]",H="[object Float64Array]",Q="[object Int8Array]",nn="[object Int16Array]",tn="[object Int32Array]",rn="[object Uint8Array]",en="[object Uint8ClampedArray]",un="[object Uint16Array]",on="[object Uint32Array]",fn=/\b__p\+='';/g,an=/\b(__p\+=)''\+/g,cn=/(__e\(.*?\)|\b__t\))\+'';/g,ln=/&(?:amp|lt|gt|quot|#39|#96);/g,sn=/[&<>"'`]/g,pn=RegExp(ln.source),hn=RegExp(sn.source),_n=/<%-([\s\S]+?)%>/g,vn=/<%([\s\S]+?)%>/g,gn=/<%=([\s\S]+?)%>/g,yn=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,dn=/^\w*$/,mn=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,wn=/^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,xn=RegExp(wn.source),bn=/[\u0300-\u036f\ufe20-\ufe23]/g,An=/\\(\\)?/g,jn=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,kn=/\w*$/,On=/^0[xX]/,In=/^\[object .+?Constructor\]$/,Rn=/^\d+$/,En=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g,Cn=/($^)/,Sn=/['\n\r\u2028\u2029\\]/g,Un=RegExp("[A-Z\\xc0-\\xd6\\xd8-\\xde]+(?=[A-Z\\xc0-\\xd6\\xd8-\\xde][a-z\\xdf-\\xf6\\xf8-\\xff]+)|[A-Z\\xc0-\\xd6\\xd8-\\xde]?[a-z\\xdf-\\xf6\\xf8-\\xff]+|[A-Z\\xc0-\\xd6\\xd8-\\xde]+|[0-9]+","g"),$n="Array ArrayBuffer Date Error Float32Array Float64Array Function Int8Array Int16Array Int32Array Math Number Object RegExp Set String _ clearTimeout isFinite parseFloat parseInt setTimeout TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array WeakMap".split(" "),Wn="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),Fn={};
Fn[X]=Fn[H]=Fn[Q]=Fn[nn]=Fn[tn]=Fn[rn]=Fn[en]=Fn[un]=Fn[on]=true,Fn[z]=Fn[B]=Fn[J]=Fn[D]=Fn[M]=Fn[q]=Fn[K]=Fn["[object Map]"]=Fn[V]=Fn[Z]=Fn[Y]=Fn["[object Set]"]=Fn[G]=Fn["[object WeakMap]"]=false;var Ln={};Ln[z]=Ln[B]=Ln[J]=Ln[D]=Ln[M]=Ln[X]=Ln[H]=Ln[Q]=Ln[nn]=Ln[tn]=Ln[V]=Ln[Z]=Ln[Y]=Ln[G]=Ln[rn]=Ln[en]=Ln[un]=Ln[on]=true,Ln[q]=Ln[K]=Ln["[object Map]"]=Ln["[object Set]"]=Ln["[object WeakMap]"]=false;var Nn={"\xc0":"A","\xc1":"A","\xc2":"A","\xc3":"A","\xc4":"A","\xc5":"A","\xe0":"a","\xe1":"a","\xe2":"a",
"\xe3":"a","\xe4":"a","\xe5":"a","\xc7":"C","\xe7":"c","\xd0":"D","\xf0":"d","\xc8":"E","\xc9":"E","\xca":"E","\xcb":"E","\xe8":"e","\xe9":"e","\xea":"e","\xeb":"e","\xcc":"I","\xcd":"I","\xce":"I","\xcf":"I","\xec":"i","\xed":"i","\xee":"i","\xef":"i","\xd1":"N","\xf1":"n","\xd2":"O","\xd3":"O","\xd4":"O","\xd5":"O","\xd6":"O","\xd8":"O","\xf2":"o","\xf3":"o","\xf4":"o","\xf5":"o","\xf6":"o","\xf8":"o","\xd9":"U","\xda":"U","\xdb":"U","\xdc":"U","\xf9":"u","\xfa":"u","\xfb":"u","\xfc":"u","\xdd":"Y",
"\xfd":"y","\xff":"y","\xc6":"Ae","\xe6":"ae","\xde":"Th","\xfe":"th","\xdf":"ss"},Tn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},Pn={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#96;":"`"},zn={"function":true,object:true},Bn={0:"x30",1:"x31",2:"x32",3:"x33",4:"x34",5:"x35",6:"x36",7:"x37",8:"x38",9:"x39",A:"x41",B:"x42",C:"x43",D:"x44",E:"x45",F:"x46",a:"x61",b:"x62",c:"x63",d:"x64",e:"x65",f:"x66",n:"x6e",r:"x72",t:"x74",u:"x75",v:"x76",x:"x78"},Dn={"\\":"\\",
"'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Mn=zn[typeof exports]&&exports&&!exports.nodeType&&exports,qn=zn[typeof module]&&module&&!module.nodeType&&module,Kn=zn[typeof self]&&self&&self.Object&&self,Vn=zn[typeof window]&&window&&window.Object&&window,Zn=qn&&qn.exports===Mn&&Mn,Yn=Mn&&qn&&typeof global=="object"&&global&&global.Object&&global||Vn!==(this&&this.window)&&Vn||Kn||this,Gn=function(){try{Object({toString:0}+"")}catch(n){return function(){return false}}return function(n){
return typeof n.toString!="function"&&typeof(n+"")=="string"}}(),Jn=m();typeof define=="function"&&typeof define.amd=="object"&&define.amd?(Yn._=Jn, define(function(){return Jn})):Mn&&qn?Zn?(qn.exports=Jn)._=Jn:Mn._=Jn:Yn._=Jn}).call(this);
/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransitions-shiv-cssclasses-prefixed-testprop-testallprops-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(prefixes.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b){for(var d in a){var e=a[d];if(!A(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function D(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+n.join(d+" ")+d).split(" ");return z(b,"string")||z(b,"undefined")?B(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),C(e,b,c))}var d="2.7.1",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.csstransitions=function(){return D("transition")};for(var E in p)w(p,E)&&(u=E.toLowerCase(),e[u]=p[E](),s.push((e[u]?"":"no-")+u));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return B([a])},e.testAllProps=D,e.prefixed=function(a,b,c){return b?D(a,b,c):D(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+s.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
/**
 * Support Plugin
 *
 * @version 2.1.0
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	var style = $('<support>').get(0).style,
		prefixes = 'Webkit Moz O ms'.split(' '),
		events = {
			transition: {
				end: {
					WebkitTransition: 'webkitTransitionEnd',
					MozTransition: 'transitionend',
					OTransition: 'oTransitionEnd',
					transition: 'transitionend'
				}
			},
			animation: {
				end: {
					WebkitAnimation: 'webkitAnimationEnd',
					MozAnimation: 'animationend',
					OAnimation: 'oAnimationEnd',
					animation: 'animationend'
				}
			}
		},
		tests = {
			csstransforms: function() {
				return !!test('transform');
			},
			csstransforms3d: function() {
				return !!test('perspective');
			},
			csstransitions: function() {
				return !!test('transition');
			},
			cssanimations: function() {
				return !!test('animation');
			}
		};

	function test(property, prefixed) {
		var result = false,
			upper = property.charAt(0).toUpperCase() + property.slice(1);

		$.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
			if (style[property] !== undefined) {
				result = prefixed ? property : true;
				return false;
			}
		});

		return result;
	}

	function prefixed(property) {
		return test(property, true);
	}

	if (tests.csstransitions()) {
		/* jshint -W053 */
		$.support.transition = new String(prefixed('transition'))
		$.support.transition.end = events.transition.end[ $.support.transition ];
	}

	if (tests.cssanimations()) {
		/* jshint -W053 */
		$.support.animation = new String(prefixed('animation'))
		$.support.animation.end = events.animation.end[ $.support.animation ];
	}

	if (tests.csstransforms()) {
		/* jshint -W053 */
		$.support.transform = new String(prefixed('transform'));
		$.support.transform3d = tests.csstransforms3d();
	}

})(window.Zepto || window.jQuery, window, document);




















// $('.modal-button').on('click', function () {
// 	var $this =  $(this);
// 	var $parent = $this.closest('.modal-wrapper');
// 	var $child = $parent.find('.modal');
// 	setTimeout(function () {
// 		$child.fadeIn();
// 		$('.close').css({
// 			'width': 60,
// 			'height': 60
// 		});
// 		$('body').addClass('modal-open');
// 	}, 200);
// 	return false;
// });
// $('.close').click(function () {
// 	var $this =  $(this);
// 	var $parent = $this.closest('.modal-wrapper');
// 	var $child = $parent.find('.modal');
// 	$child.fadeOut();
// 	$('.close').css('width', '0px');
// 	$('.close').css('height', '0px');
// 	$('body').removeClass('modal-open');
// });


// $('.form-button').on('click', function(){
// 	var $this =  $(this);
// 	var $parent = $this.closest('.button-show');
// 	var $child = $parent.find('.button-block');
// 	$child.show();
// 	$('.form-button').css('opacity', 0);
// 	return false;
// })








'use strict';

$(document).ready(function() {
	same_height();
	counter();
	overlay_menu();
	toggle_menu();
	fold_animate();
});


function counter(){
	var tmp = '<div class="time <%= label %>">'+
				'<span class="count curr top"><%= curr %></span>'+
				'<span class="count next top"><%= next %></span>'+
				'<span class="count next bottom"><%= next %></span>'+
				'<span class="count curr bottom"><%= curr %></span>'+
				'<span class="label"><%= label.length < 6 ? label : label.substr(0, 7) %></span>'+
			'</div>'+
			'<span class="dot <%= label %>"></span>';
	//$('#counter-template').html(tmp)
	var labels = ['weeks', 'days', 'hours', 'minutes', 'seconds'],
		dt = new Date(),
		countDate = dt.setDate(dt.getDate() + 2),
		template = _.template(tmp),
		currDate = '00:00:00:00:00',
		nextDate = '00:00:00:00:00',
		parser = /([0-9]{2})/gi,
		$counter = $('#counter'),
		hoursOnly = true;

	// Parse countdown string to an object
	function strfobj(str) {
		var parsed = str.match(parser),
			obj = {};
		labels.forEach(function(label, i) {
			obj[label] = parsed[i]
		});
		return obj;
	}
	// Return the time components that diffs
	function diff(obj1, obj2) {
		var diff = [];
		labels.forEach(function(key) {
			if (obj1[key] !== obj2[key]) {
				diff.push(key);
			}
		});
		return diff;
	}
	// Build the layout
	var initData = strfobj(currDate);
	labels.forEach(function(label, i) {
		$counter.append(template({
			curr: initData[label],
			next: initData[label],
			label: label
		}));
	});
	//Starts the countdown
	$counter.countdown(countDate, function(event) {
		var newDate = event.strftime('%w:%D:%H:%M:%S'),
			data;
		if (newDate !== nextDate) {
			currDate = nextDate;
			nextDate = newDate;
			// Setup the data
			data = {
				'curr': strfobj(currDate),
				'next': strfobj(nextDate)
			};

			if (hoursOnly == true) {
				var totalCurrHours = Number(data.curr.days) * 24 + Number(data.curr.hours),
					totalNextHours = Number(data.next.days) * 24 + Number(data.next.hours);

				if (String(totalCurrHours).length == 1) {
					totalCurrHours = '0'+totalCurrHours;
				}
				if (String(totalNextHours).length == 1) {
					totalNextHours = '0'+totalNextHours;
				}
				data.curr.days = 0;
				data.curr.hours = totalCurrHours;
				data.next.days = 0;
				data.next.hours = totalNextHours;
			}
			// Apply the new values to each node that changed
			diff(data.curr, data.next).forEach(function(label) {
				var selector = '.%s'.replace(/%s/, label),
					$node = $counter.find(selector);
				// Update the node
				$node.removeClass('flip');
				$node.find('.curr').text(data.curr[label]);
				$node.find('.next').text(data.next[label]);
				// Wait for a repaint to then flip
				_.delay(function($node) {
					$node.addClass('flip');
				}, 50, $node);
			});
		}
	});
}

function same_height(){
	if (!$().matchHeight) {
		console.error('plugin matchHeight notfound');
		return;
	}
	$('.same-height').matchHeight();
}

function overlay_menu(){
	var triggerBttn = document.getElementById( 'trigger-overlay' ),
		overlay = document.querySelector( 'div.overlay' ),
		closeBttn = overlay.querySelector( 'button.overlay-close' );
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function toggleOverlay() {
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				classie.remove( overlay, 'close' );
				$('.overlay-menu li a').removeClass('animated fadeInRight');
			};
			if( support.transitions ) {
				overlay.addEventListener( transEndEventName, onEndTransitionFn );
			}
			else {
				onEndTransitionFn();
			}
		}
		else if( !classie.has( overlay, 'close' ) ) {
			classie.add( overlay, 'open' );
			$('.McButton').on('click', function(){
				$('.overlay-menu li a').addClass('animated fadeInRight');
			})
		}
	}

	triggerBttn.addEventListener( 'click', toggleOverlay );
	closeBttn.addEventListener( 'click', toggleOverlay );
}

function toggle_menu(){
	var McButton = $("[data=hamburger-menu]");
	var McBar1 = McButton.find("b:nth-child(1)");
	var McBar2 = McButton.find("b:nth-child(2)");
	var McBar3 = McButton.find("b:nth-child(3)");

	McButton.click( function() {
	  $(this).toggleClass("active");

	  if (McButton.hasClass("active")) {
	    McBar1.velocity({ top: "50%" }, {duration: 200, easing: "swing"});
	    McBar3.velocity({ top: "50%" }, {duration: 200, easing: "swing"})
	    			.velocity({rotateZ:"90deg"}, {duration: 800, delay: 200, easing: [500,20] });
	    McButton.velocity({rotateZ:"135deg"}, {duration: 800, delay: 200, easing: [500,20] });
	  } else {
	    McButton.velocity("reverse");
			McBar3.velocity({rotateZ:"0deg"}, {duration: 800, easing: [500,20] })
	    			.velocity({ top: "100%" }, {duration: 200, easing: "swing"});
	  	McBar1.velocity("reverse", {delay: 800});
	  }
	});


	$('.navbar-menu').on('click', function(){
		$(this).toggleClass('open-menu');
		$('body').toggleClass('open');
	})
}

function fold_animate(){
	var $body = $('body'),
		$block = $('.block-main'),
		$brand = $('.navbar-brand'),
		$brandWrap = $('.navbar-brand-wrapper'),
		$brandOverlay = $('.brand-overlay'),
		$content = $('.block-main-title, .block-main-image, .navbar-menu, .counter-wrapper'),
		$mainButton = $('.block-main-button'),
		$topImage = $('.image-absolute');


	$body.addClass('start-animate');
	$body.addClass('start-brand-animate');  //.start-brand-animate
	$brandOverlay.addClass('brand-overlay-animate');
	$block.addClass('block-main-overlay')

	$brandOverlay.one($.support.animation.end, function() {
		$block.removeClass('block-main-overlay')
		$brand.addClass('brand-animate');
		$brandOverlay.removeClass('brand-overlay-animate brand-overlay');

		var brandAnimation = function (){
			$brand.addClass('brand-animate');
			$brand.velocity({
				//scale: 1,
				left: $brandWrap.offset().left,
				right: $(window).width() - ($brandWrap.width() + $brandWrap.offset().left),
				top: $brandWrap.offset().top,
				bottom: $(window).height() - ($brandWrap.height() + $brandWrap.offset().top)
			},
			{
				complete: function(){
					topPartAnimation();
					$body.removeClass('start-brand-animate');
					$brand.removeClass('brand-animate').removeAttr('style');
				}
			}, "easeInSine");
		}
console.log($brandWrap.offset().left, $(window).width() - ($brandWrap.width() + $brandWrap.offset().left), $brandWrap.offset().top, $(window).height() - ($brandWrap.height() + $brandWrap.offset().top))
		brandAnimation();

		var topPartAnimation = function(){
			$content.addClass('animated zoomInDown');
			$mainButton.addClass('animated zoomInDown');
			$mainButton.one($.support.animation.end, function() {
				ImagePercent();
			});
		}

		var ImagePercent = function(){
			$topImage.addClass('animated lightSpeedIn');
			$topImage.velocity({
				complete: function(){
					$body.removeClass('start-animate');

				}
			})
		}

	})
	$topImage.one($.support.animation.end, function() {
		$content.removeClass('animated zoomInDown');
		$mainButton.removeClass('animated zoomInDown');
		$topImage.removeClass('animated lightSpeedIn');
	})
}
