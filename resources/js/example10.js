define("Example10Ctrl", function () {
    return function (uku) {
        this.options = [
            {
                "name": "Kamaka",
                "value": "kamaka",
                "children": [
                    {
                        "name": "HF1"
                    }, {
                        "name": "HF2"
                    }, {
                        "name": "HF3"
                    }
		]
            },
            {
                "name": "Koaloha",
                "value": "koaloha",
                "children": [
                    {
                        "name": "KSM"
                    }, {
                        "name": "KCM"
                    }, {
                        "name": "KTM"
                    }
		]
            },
            {
                "name": "Kanilea",
                "value": "kanilea",
                "children": [
                    {
                        "name": "K1S"
                    }, {
                        "name": "K2C"
                    }, {
                        "name": "K1T"
                    }
		]
            },
            {
                "name": "Koolau ",
                "value": "koolau",
                "children": [
                    {
                        "name": "CS Tenor"
                    }, {
                        "name": "Model 100"
                    }, {
                        "name": "Tenor Deluxe"
                    }
		]
            }
	];
        this.selectedOption = this.options[2];
        this.selectedChildOption = this.selectedOption.children[0];

        this.selectedOptionChanged = function () {
            this.selectedChildOption = this.selectedOption.children[0];
            uku.refresh();
        };
    };
});