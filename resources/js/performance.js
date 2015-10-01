define("PerformanceCtrl", ["Chart", "jquery"], function (Chart, $) {
    var options = {
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>"

    };
    
    var myBarChart;
    function drawBarChart(type) {
        var dataUlr = "resources/data/performance_2k.json";
        if(type === 20000){
            dataUlr = "resources/data/performance_2w.json";
        }
        
        var dataProvider = {};
        $.get(dataUlr, function (result) {
            for (var key in result) {
                var obj = result[key];
                for (var framework in obj) {
                    var timeArray = obj[framework];
                    var avg = getTimeAvg(timeArray);
                    if (!dataProvider[framework]) {
                        dataProvider[framework] = {};
                    }
                    dataProvider[framework][key] = avg;
                }
            }
            for (var i = 0; i < data.labels.length; i++) {
                var name = data.labels[i];

                for (var browser in dataProvider[name]) {
                    var dataset = getDatasetByLabel(browser);
                    dataset.data.push(dataProvider[name][browser]);
                }
            }
            if(myBarChart){
                myBarChart.destroy();
            }
            var ctx = document.getElementById("myChart").getContext("2d");
            myBarChart = new Chart(ctx).Bar(data, options);
            
            var legend = myBarChart.generateLegend();
            $("#myLegend").empty();
            $("#myLegend").append(legend);
        });

        function getDatasetByLabel(lable) {
            for (var i = 0; i < data.datasets.length; i++) {
                var dataset = data.datasets[i];
                if (dataset.label === lable) {
                    return dataset;
                }
            }
            return null;
        }

        function getTimeAvg(arr) {
            arr.sort(function (a, b) {
                return a < b ? 1 : -1
            });
            arr.pop();
            arr.shift();
            var sum = eval(arr.join("+"));
            var avg = Math.floor(sum / arr.length);
            return avg;
        }
        var data = {
            labels: ["ukulele", "angular", "avalon", "react", "vue"],
            datasets: [
                {
                    label: "chrome",
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,220,220,0.75)",
                    highlightStroke: "rgba(220,220,220,1)",
                    data: []
        },
                {
                    label: "firefox",
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: []
        },
                {
                    label: "ie",
                    fillColor: "rgba(151,250,205,0.5)",
                    strokeColor: "rgba(151,250,205,0.8)",
                    highlightFill: "rgba(151,250,205,0.75)",
                    highlightStroke: "rgba(151,250,205,1)",
                    data: []
        }
    ]
        };


    }

    return function () {
        this.init = function(){
            drawBarChart(2000);
        }
        this.options = [{"name":2000,"value":2000},{"name":20000,"value":20000}];
        this.selectedOption = this.options[0];
        
        this.onSelectChanged = function(){
            var type = this.selectedOption.value;
            drawBarChart(type);
        };
    };
});