$('.table-responsive').on('show.bs.dropdown', function (e) {
    let $menu = $(e.target).find('.more-option-h');
    $('.dropdown-menu-list1').addClass('list-dropdown').css('top', $menu.offset().top + 'px');
    $('.dropdown-menu-list1').css('left', '22px');
});
$('.table-responsive').on('hide.bs.dropdown', function () {
    $('.dropdown-menu-list1').removeClass('list-dropdown');
});
