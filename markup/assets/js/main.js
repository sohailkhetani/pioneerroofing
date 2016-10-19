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
				$('.overlay-menu li').removeClass('fadeInRight');
				$('.overlay-menu li a').removeClass('fadeInRight');
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
				$('.overlay-menu li').addClass('fadeInRight');
				$('.overlay-menu li a').addClass('fadeInRight');
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
