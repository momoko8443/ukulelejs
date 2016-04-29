require.config({
    paths: {
        "Ukulele": '../dist/ukulele',
        "domReady": 'lib/domReady'
    }
});

require(["domReady", "Ukulele"],function (domReady, Ukulele) {
    domReady(function () {
        var uku = new Ukulele();

    });
});
