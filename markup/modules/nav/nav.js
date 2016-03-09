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
