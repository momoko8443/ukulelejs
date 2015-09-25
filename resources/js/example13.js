define("Example13Ctrl", function () {
    return function (uku) {
        var citiesSpanPool = {};
        this.setRowSpan = function (rowItem, field) {
            if (!citiesSpanPool[rowItem[field]]) {
                var rowCount = 0;
                for (var i = 0; i < this.cities.length; i++) {
                    var item = this.cities[i];
                    if (rowItem[field] === item[field]) {
                        rowCount++;
                    }
                }
                citiesSpanPool[rowItem[field]] = rowCount;
                return citiesSpanPool[rowItem[field]];
            } else {
                return 1;
            }

        };
        var citiesStylePool = {};
        this.setRowStyle = function (rowItem, field) {
            if (!citiesStylePool[rowItem[field]]) {
                for (var i = 0; i < this.cities.length; i++) {
                    var item = this.cities[i];
                    if (rowItem[field] === item[field]) {
                        citiesStylePool[rowItem[field]] = true;
                        break;
                    }
                }
                return "";
            } else {
                return "display:none";
            }
        };

        this.cities = [{
            'area': 'Asia',
            'country': 'China',
            'city': 'Shanghai',
            'total': 100
    }, {
            'area': 'Asia',
            'country': 'China',
            'city': 'Beijing',
            'total': 200
    }, {
            'area': 'Asia',
            'country': 'Japan',
            'city': 'Tokyo',
            'total': 300
    }, {
            'area': 'Asia',
            'country': 'Japan',
            'city': 'Yokohama',
            'total': 400
    }];

    };
});