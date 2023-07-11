let $header = $('.app-header').height() || 60;
let $topHeader = $('.top-header-bar').height() || 16;
let $subHeaderHt = 59;
$(window).on('resize', function () {
    let height = $(this).height() - ($header + $topHeader + $subHeaderHt + 138);
    $('.log').height(height);
}).trigger('resize'); //on page load