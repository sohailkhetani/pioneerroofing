$('.js-accordion-trigger').bind('click', function (e) {
    jQuery(this).parent().find('.submenu').slideToggle('fast');  // apply the toggle to the ul
    jQuery(this).parent().toggleClass('is-expanded');
    e.preventDefault();
});
















$('#window').click(function () {
    // var sa = $(this).text();
    // $(this).text('');
    // $(this).addClass('ball');
    setTimeout(function () {
        $('#modal').fadeIn();
        $('#close').css('width', '30px');
        $('#close').css('height', '30px');
        setTimeout(function () {
            // $('#window').removeClass('ball');
            // $('#window').text(sa);
        }, 500);
    }, 200);
});
$('#close').click(function () {
    $('#modal').fadeOut();
    $('#close').css('width', '0px');
    $('#close').css('height', '0px');
});

$(document).ready(function () {
    var menuToggle = $('#js-centered-navigation-mobile-menu').unbind();
    $('#js-centered-navigation-menu').removeClass('show');
    menuToggle.on('click', function (e) {
        e.preventDefault();
        $('#js-centered-navigation-menu').slideToggle(function () {
            if ($('#js-centered-navigation-menu').is(':hidden')) {
                $('#js-centered-navigation-menu').removeAttr('style');
            }
        });
    });
});
