(function () {
    function setMarginTop() {
        document.getElementById('logs').style.marginTop = (document.getElementById('upper-header').clientHeight + 1) + 'px';
    }

    // handle resize event
    window.addEventListener("resize", function () {
        setMarginTop();
    });
    setTimeout(function () {
        setMarginTop();
    }, 800);
})();
