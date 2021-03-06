'use strict';

$(document).ready(function() {
	sticky_init();
	same_height();
	counter();
	overlay_menu();
	toggle_menu();
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

function sticky_init(){
	$("#sticker").sticky({
		topSpacing: 100
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
		}
	}

	triggerBttn.addEventListener( 'click', toggleOverlay );
	closeBttn.addEventListener( 'click', toggleOverlay );
}

function toggle_menu(){
	$('.hmbrgr').hmbrgr({
		width     : 30,
		height    : 26,
		barHeight : 4,
		barRadius : 10,
		barColor  : '#424242'
	});
	$('.navbar-menu').on('click', function(){
		$(this).toggleClass('open-menu');
	})
}
