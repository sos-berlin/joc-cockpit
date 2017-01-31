!function (a) {
    a.fn.stickySidebar = function (b) {
        var c = a.extend({
            subHeaderSelector: ".sub-header",
            sidebarTopMargin: 20
        }, b), d = function () {
            var b = a(this), y = a(c.subHeaderSelector).height();

            if (y!=95){
                if(y==121){
                     b.addClass("sticky").css("top", 216)
                }else
                b.addClass("sticky").css("top", c.sidebarTopMargin);
            }
            else {
                b.addClass("sticky").css("top", 190)
            }
        };
        return this.each(function () {
            a(window).on("scroll", a.proxy(d, this)), a(window).on("resize", a.proxy(d, this)), a.proxy(d, this)()
        })
    }
}(jQuery);