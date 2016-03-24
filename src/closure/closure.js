(function(){
    if (typeof define === 'function' && define.amd) {
        define('Ukulele', [], function() {
            return Ukulele;
        });
    } else if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Ukulele;
        }
        exports.Ukulele = Ukulele;
    } else {
        window['Ukulele'] = Ukulele;
    }

    //=include ukulele.js
})();
