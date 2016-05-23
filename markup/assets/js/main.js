'use strict';

$(document).ready(function() {
	sticky_init();
	same_height();
	counter();
	overlay_menu();
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
		countDate = '2016/05/25',
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

function sticky_init(){
	$("#sticker").sticky({
		topSpacing: 0
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
	var overlayNav = $('.cd-overlay-nav'),
		overlayContent = $('.cd-overlay-content'),
		navigation = $('.cd-primary-nav'),
		toggleNav = $('.cd-nav-trigger');

	//inizialize navigation and content layers
	layerInit();
	$(window).on('resize', function(){
		window.requestAnimationFrame(layerInit);
	});

	//open/close the menu and cover layers
	toggleNav.on('click', function(){
		if(!toggleNav.hasClass('close-nav')) {
			//it means navigation is not visible yet - open it and animate navigation layer
			toggleNav.addClass('close-nav');
			
			overlayNav.children('span').velocity({
				translateZ: 0,
				scaleX: 1,
				scaleY: 1,
			}, 500, 'easeInCubic', function(){
				navigation.addClass('fade-in');
			});
		} else {
			//navigation is open - close it and remove navigation layer
			toggleNav.removeClass('close-nav');
			
			overlayContent.children('span').velocity({
				translateZ: 0,
				scaleX: 1,
				scaleY: 1,
			}, 500, 'easeInCubic', function(){
				navigation.removeClass('fade-in');
				
				overlayNav.children('span').velocity({
					translateZ: 0,
					scaleX: 0,
					scaleY: 0,
				}, 0);
				
				overlayContent.addClass('is-hidden').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
					overlayContent.children('span').velocity({
						translateZ: 0,
						scaleX: 0,
						scaleY: 0,
					}, 0, function(){overlayContent.removeClass('is-hidden')});
				});
				if($('html').hasClass('no-csstransitions')) {
					overlayContent.children('span').velocity({
						translateZ: 0,
						scaleX: 0,
						scaleY: 0,
					}, 0, function(){overlayContent.removeClass('is-hidden')});
				}
			});
		}
	});

	function layerInit(){
		var diameterValue = (Math.sqrt( Math.pow($(window).height(), 2) + Math.pow($(window).width(), 2))*2);
		overlayNav.children('span').velocity({
			scaleX: 0,
			scaleY: 0,
			translateZ: 0,
		}, 50).velocity({
			height : diameterValue+'px',
			width : diameterValue+'px',
			top : -(diameterValue/2)+'px',
			left : -(diameterValue/2)+'px',
		}, 0);

		overlayContent.children('span').velocity({
			scaleX: 0,
			scaleY: 0,
			translateZ: 0,
		}, 50).velocity({
			height : diameterValue+'px',
			width : diameterValue+'px',
			top : -(diameterValue/2)+'px',
			left : -(diameterValue/2)+'px',
		}, 0);
	}
}