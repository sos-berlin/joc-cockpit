function allowDrop(ev) {
    if (ev.target.tagName && ev.target.tagName.toLowerCase() === 'svg') {
        ev.preventDefault();
    } else if (ev.target.tagName && ev.target.tagName.toLowerCase() === 'div') {
        if (ev.target.className && (ev.target.className.match(/job/) || ev.target.className.match(/event1/) || ev.target.className.match(/in-condition/))) {
            ev.preventDefault();
        } else if (ev.target.childElementCount > 0) {
            let className = ev.target.childNodes[0].className;
            if (className && (className.match(/job/) || className.match(/event1/) || className.match(/in-condition/))){
                ev.preventDefault();
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}

function allowDrop1(ev) {
    if (ev.target.tagName && ev.target.tagName.toLowerCase() === 'svg') {
        ev.preventDefault();
    } else if (ev.target.tagName && (ev.target.tagName.toLowerCase() === 'div' || ev.target.tagName.toLowerCase() === 'span')) {
        if(ev.target.dataset)
            if (ev.target.className && typeof ev.target.className === 'string' && ev.target.className.match(/job/)) {
                ev.preventDefault();
            } if (ev.target.dataset && ev.target.dataset.state) {
            ev.preventDefault();
        }else if (ev.target.childElementCount > 0) {
            let className = ev.target.childNodes[0].className;
            if (className.match(/job/)) {
                ev.preventDefault();
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}

function drag(ev) {
    ev.dataTransfer.setData("data", ev.target.id);
    window.selectedJob = ev.target.id;
}