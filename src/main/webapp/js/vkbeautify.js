(function() {
    function createShiftArr(step) {
        var space = '    ';
        if ( isNaN(parseInt(step)) ) {  // argument is string
            space = step;
        } else { // argument is integer
            switch(step) {
                case 1: space = ' '; break;
                case 2: space = '  '; break;
                case 3: space = '   '; break;
                case 4: space = '    '; break;
                case 5: space = '     '; break;
                case 6: space = '      '; break;
                case 7: space = '       '; break;
                case 8: space = '        '; break;
                case 9: space = '         '; break;
                case 10: space = '          '; break;
                case 11: space = '           '; break;
                case 12: space = '            '; break;
            }
        }

        var shift = ['\n']; // array of shifts
        for(ix=0;ix<100;ix++){
            shift.push(shift[ix]+space);
        }
        return shift;
    }

    function vkbeautify(){
        this.step = '\t'; // 4 spaces
        this.shift = createShiftArr(this.step);
    };

    vkbeautify.prototype.xml = function(text,step) {
        var ar = text.replace(/>\s{0,}</g,"><")
                .replace(/</g,"~::~<")
                .replace(/\s*xmlns\:/g,"~::~xmlns:")
                .replace(/\s*xmlns\=/g,"~::~xmlns=")
                .split('~::~'),
            len = ar.length,
            inComment = false,
            deep = 0,
            str = '',
            ix = 0,
            shift = step ? createShiftArr(step) : this.shift;


        for(ix=0;ix<len;ix++) {
            // start comment or <![CDATA[...]]> or <!DOCTYPE //
            if(ar[ix].search(/<!/) > -1) {
                str += shift[deep]+ar[ix];
                inComment = true;
                // end comment  or <![CDATA[...]]> //
                if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) {
                    inComment = false;
                }
            } else
                // end comment  or <![CDATA[...]]> //
            if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
                str += ar[ix];
                inComment = false;
            } else
                // <elm></elm> //
            if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
                /^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) {
                str += ar[ix];
                if(!inComment) deep--;
            } else
                // <elm> //
            if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
                str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];

            } else
                // <elm>...</elm> //
            if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
                str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
            } else
                // </elm> //
            if(ar[ix].search(/<\//) > -1) {
                str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
            } else
                // <elm/> //
            if(ar[ix].search(/\/>/) > -1 ) {
                str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
            } else
                // <? xml ... ?> //
            if(ar[ix].search(/<\?/) > -1) {
                str += shift[deep]+ar[ix];
            } else
                // xmlns //
            if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) {
                str += shift[deep]+ar[ix];
            }

            else {
                str += ar[ix];
            }
        }
        let a = (str[0] == '\n') ? str.slice(1) : str;
        let arr = a.split('\n');
        let flag = false;
        let _tempXml;
        for (let i = 0; i < arr.length; i++) {
            if (/<!\[CDATA\[.*|(\s|\w|\n|\r)*\]\]>/g.test(arr[i])) {
                flag = true;
                if(/<!\[CDATA\[.*|(\s|\w|\n|\r)*\]\]>/g.exec(arr[i])[1]){
                    console.log('if',/<!\[CDATA\[.*|(\s|\w|\n|\r)*\]\]>/g.exec(arr[i]))
                    flag = false;
                    _tempXml = _tempXml + '\n' + arr[i];
                }else{
                    _tempXml = _tempXml + arr[i].replace(/^[\s\uFEFF\xA0]+/g, '');
                }
            } else {
                let flg = false;
                if(i > 0 && /<!\[CDATA\[.*|(\s|\w|\n|\r)*\]\]>/g.test(arr[i-1])) {
                    if(/]]>/g.test(arr[i-1])){
                        _tempXml = _tempXml + arr[i].replace(/^[\s\uFEFF\xA0]+/g, '');
                        flg = true;
                    }
                }
                if(!flg) {
                    if(_tempXml) {
                        _tempXml = _tempXml + '\n' + arr[i];
                    }else{
                        _tempXml = arr[i];
                    }
                }
            }
        }
        return _tempXml ;
    }
    
    vkbeautify.prototype.xmlmin = function(text, preserveComments) {
        var str = preserveComments ? text
            : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"")
                .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
        return  str.replace(/>\s{0,}</g,"><");
    }

    window.vkbeautify = new vkbeautify();

})();

