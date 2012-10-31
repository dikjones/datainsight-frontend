var GOVUK = GOVUK || {};
GOVUK.Insights = GOVUK.Insights || {};

GOVUK.Insights.uniqueVisitors = function () {
    function showError() {
        $("#unique-visitors").append(GOVUK.Insights.Helpers.error_div);
        $('#visits-module img').remove();
        $('#visits-module .datainsight-hidden').removeClass('datainsight-hidden');
    }

    $.ajax({
        url:"/performance/graphs/unique-visitors.json",
        dataType:"json",
        success:function (data) {
            if (GOVUK.isSvgSupported()) {
                $('#unique-visitors-module img').remove();
                var graph = GOVUK.Insights.sixMonthTimeSeries("#unique-visitors", {
                    "series":{
                        "directgov":{
                            "lineClass":"dashed-line brown",
                            "legendClass":"brown-text",
                            "legend": {
                                "text": "Directgov",
                                "anchor": "2012-10-07",
                                "yOffset": -10
                            }
                        },
                        "businesslink":{
                            "lineClass":"dashed-line purple",
                            "legendClass":"purple-text",
                            "legend": {
                                "text": "Business Link",
                                "anchor": "2012-09-16",
                                "yOffset": -10
                            }
                        },
                        "govuk":{
                            "lineClass":"main-line",
                            "legendClass":"",
                            "legend":{
                                "text": "GOV.UK",
                                "anchor": "2012-10-20",
                                "xOffset": -35,
                                "yOffset": 30
                            }
                        }
                    },
                    "width":444
                });
                try {
                    graph.render(data);
                    $('#unique-visitors-module .datainsight-hidden').removeClass('datainsight-hidden');
                } catch (err) {
                    showError();
                }
            }
        },
        error:showError
    });
}

// Register with jQuery's document.ready event
$(GOVUK.Insights.uniqueVisitors);