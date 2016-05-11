'use strict';

$(document).ready(function() {
	sticky_init();
	same_height();
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