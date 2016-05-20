'use strict';

$(document).ready(function() {
	sticky_init();
	same_height();
	counter();
});

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

function counter(){
	$('.counter').countdown('2016/05/23', function(event) {
		var totalHours = event.offset.totalDays * 24 + event.offset.hours;
		$(this).html(event.strftime(totalHours + ' : %M : %S'));
	});
}