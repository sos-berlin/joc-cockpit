function themeInit() {
    if (window.localStorage.$SOS$THEME !== undefined && window.localStorage.$SOS$THEME !== 'undefined') {
        document.getElementById('style-color').href = 'css/' + window.localStorage.$SOS$THEME + '-style.css?_v=1608012679343';
    }
}

themeInit();
$(window).on('popstate', function () {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});