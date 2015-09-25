define("Example14Ctrl",["moment"], function (moment) {
    return function (uku) {
        this.onDatetimepickerCompleted = function (e) {
            var self = this;
            var $picker = $('.form_date').datetimepicker({
                language: 'zh-CN',
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                minView: 2,
                forceParse: 0
            }).on("changeDate", function (ev) {

                self.initialDate = moment(ev.date).format("YYYY-MM-DD");
                uku.refresh('ex14Ctrl');
            });
        };

        this.initialDate = "2011-05-06";
    };
});