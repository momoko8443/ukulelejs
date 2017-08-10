require.config({
    paths: {
        "Ukulele": '../dist/uku',
        "domReady": 'lib/domReady'
    }
});

require(["domReady", "Ukulele"],function (domReady, Ukulele) {
    domReady(function () {
        var uku = new Ukulele.Ukulele();

    });
});
