$('.table-responsive').on('show.bs.dropdown', function (e) {
    let $menu = $(e.target).find('.more-option-h');
    if ($menu.offset().top + 70 > $(window).innerHeight() + $(window).scrollTop()) {
        $('.dropdown-menu-list').css('top', $(window).innerHeight() - 70 + 'px');
        $('.dropdown-menu-list').removeClass('dropdown-ac');
        $('.dropdown-menu-list').addClass('dropdown-list');
    } else {
        $('.dropdown-menu-list').css('top', $menu.offset().top + 20 + 'px');
    }
    $('.dropdown-menu-list').addClass('list-dropdown');
    $('.dropdown-menu-list').css('left', $menu.offset().left + 'px');
});

$('.table-responsive').on('hide.bs.dropdown', function () {
    $('.dropdown-menu-list').removeClass('list-dropdown');
    $('.dropdown-menu-list').removeClass('dropdown-list');
    $('.dropdown-menu-list').addClass('dropdown-ac');
});


