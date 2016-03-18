$('.modal-button').on('click', function () {
	var $this =  $(this);
	var $parent = $this.closest('.modal-wrapper');
	var $child = $parent.find('.modal');
	setTimeout(function () {
		$child.fadeIn();
		$('.close').css({
			'width': 60,
			'height': 60
		});
		$('body').addClass('modal-open');
	}, 200);
	return false;
});
$('.close').click(function () {
	var $this =  $(this);
	var $parent = $this.closest('.modal-wrapper');
	var $child = $parent.find('.modal');
	$child.fadeOut();
	$('.close').css('width', '0px');
	$('.close').css('height', '0px');
	$('body').removeClass('modal-open');
});


$('.form-button').on('click', function(){
	var $this =  $(this);
	var $parent = $this.closest('.button-show');
	var $child = $parent.find('.button-block');
	$child.show();
	$('.form-button').css('opacity', 0);
	return false;
})

$("#sticker").sticky({
	topSpacing: 0,
	//getWidthFrom: ('.wrapper')

});