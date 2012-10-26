var GOVUK = GOVUK || {};
GOVUK.Insights = GOVUK.Insights || {};

GOVUK.Insights.formatSuccess = function () {
    function showError() {
        $("#format-success-module").append(GOVUK.Insights.Helpers.error_div);
    }

    $.ajax({
        url:'/performance/graphs/format-success.json',
        success:function (data) {
            if (data !== null) {
                GOVUK.Insights.updateFormatSelect(data);
                if (GOVUK.isSvgSupported()) {
                    $('#format-success-module img').remove();
                    GOVUK.Insights.plotFormatSuccessGraph(data);
                    $('#format-success-module .datainsight-hidden').removeClass('datainsight-hidden');
                }
            } else {
                showError();
            }
        }});
};

GOVUK.Insights.lastBigBlob = null;

GOVUK.Insights.updateFormatSelect = function(data) {
    $(data).each(function(i, datum) {
        $("#format-select")
            .append(
                $("<option></option>")
                    .attr("value", datum.format.replace(/\s+/, "-").toLowerCase())
                    .text(datum.format)
            )
            .on("change", function(e) {
                if ($(this).val() == "all") {
                    GOVUK.Insights.successRoot();
                } else {
                    GOVUK.Insights.successForFormat($(this).val());
                }
            });
    });
};

GOVUK.Insights.selectFormat = function(format) {
    $("#format-select").val(format);
};

GOVUK.Insights.successForFormat = function(format, startPos) {
    GOVUK.Insights.lastBigBlob = startPos;
    GOVUK.Insights.successForUrl("/performance/graphs/format-success/" + format + ".json", {
        maxRadius: 15,
        noRadialScale: false,
        hideKey: true,
        startingRadius: 2,
        strokeColour: "#888",
        setYLimits: true,
        startPos: startPos,
        isDetail: true
    });
};

GOVUK.Insights.successRoot = function() {
    d3.selectAll("#format-success circle.format")
        .transition()
        .duration(1000)
            .style("opacity", 0)
        .transition()
        .duration(function() {
            return (Math.random() * 500) + 500;
        })
            .attr("cx", GOVUK.Insights.lastBigBlob.x)
            .attr("cy", GOVUK.Insights.lastBigBlob.y)
            .each("end", function() {
                GOVUK.Insights.successForUrl("/performance/graphs/format-success.json");
            });

};

GOVUK.Insights.successForUrl = function(url, options) {
    $.ajax({
        url: url,
        success: function(data) {
            if (data != null) {
                // reset element
                $("#format-success svg").remove();
                $("#format-success-legend svg").remove();
                // redraw from scratch
                GOVUK.Insights.plotFormatSuccessGraph(data, options || {});
            }
        }
    })
};

GOVUK.Insights.plotFormatSuccessGraph = function (data, options) {
    options = options || {};
    // - Constants -
    var MIN_Y = 0,
        MAX_Y = 100,
        MAX_RADIUS = options.maxRadius || 30,
        GUTTER_FOR_BUBBLES = 40,
        HEIGHT = 400,
        GUTTER_X = 32,
        GUTTER_Y_TOP = 25,
        RADIAL_SCALE = !(options.noRadialScale || false),
        START_RADIUS = options.startingRadius || 0;

    // - Derived Constants -
    var WIDTH = 924 - GUTTER_X * 2;

    var values = data.map(
        function (formatEvents) {
            return {
                formatName:formatEvents["format"],
                needId: formatEvents["needId"],
                total:formatEvents["entries"],
                percentageOfSuccess:formatEvents["percentage_of_success"]
            };
        });

    var MAX_X = d3.max(values, function (formatData) {
        return formatData["total"];
    });

    var REAL_MIN_Y = options.setYLimits ? d3.min(values, function(d) { return d.percentageOfSuccess; }) : MIN_Y,
        REAL_MAX_Y = options.setYLimits ? d3.max(values, function(d) { return d.percentageOfSuccess; }) : MAX_Y;

    var radiusScale = d3.scale.linear()
        .domain([0, MAX_X])
        .range([Math.PI * Math.pow(START_RADIUS, 2), Math.PI * Math.pow(MAX_RADIUS, 2)]);

    var radius = function (total) {
        return Math.sqrt(radiusScale(total) / Math.PI);
    };

    var x = d3.scale.linear()
            .domain([0, MAX_X])
            // TODO: move the gutter out of the scale, this should
            //       be handled by extending the max of the domain by whatever is needed
            .range([GUTTER_FOR_BUBBLES + MAX_RADIUS / 2, WIDTH - (GUTTER_FOR_BUBBLES + MAX_RADIUS / 2)]),
        y = d3.scale.linear()
            .domain([REAL_MIN_Y, REAL_MAX_Y])
//            .domain([MIN_Y, MAX_Y])
            .range([HEIGHT, 0]);

    var overlayBottom = function (d) {
        var overlay = y(d.percentageOfSuccess) + radius(d.total) - HEIGHT;
        return overlay > 0 ? overlay : 0;
    };

    var GUTTER_Y_BOTTOM = GUTTER_Y_TOP + d3.max(values, overlayBottom) + 25;

    var colorScale = d3.scale.linear()
        .domain([
            REAL_MIN_Y,
            REAL_MIN_Y + (REAL_MAX_Y - REAL_MIN_Y) / 100 * 40,
            REAL_MIN_Y + (REAL_MAX_Y - REAL_MIN_Y) / 2,
            REAL_MIN_Y + (REAL_MAX_Y - REAL_MIN_Y) / 100 * 60,
            REAL_MAX_Y
        ])
//        .domain([MIN_Y, MIN_Y + (MAX_Y - MIN_Y) / 2, MAX_Y])
        .range(["#BF1E2D", "#B3B3B3", "#B3B3B3", "#B3B3B3", "#74B74A"]);

    var svg = d3.select("#format-success")
        .data(values)
        .append("svg:svg")
        .attr("width", WIDTH + GUTTER_X * 2)
        .attr("height", HEIGHT + GUTTER_Y_TOP + GUTTER_Y_BOTTOM);

    var panel = svg
        .append("svg:g")
        .attr("transform", "translate(" + 0 + "," + 20 + ")");

    var graph = panel
        .append("svg:g")
        .attr("transform", "translate(" + GUTTER_X + "," + GUTTER_Y_TOP + ")");

    var plotData = function (graph) {
        // Draw xy scatterplot
        graph.selectAll("circle.format")
            .data(values)
            .enter().append("svg:circle")
            .attr("class", "format")
            .attr("fill", function (d) {
                return colorScale(d.percentageOfSuccess);
            })
            .style("opacity", 0)
            .attr("cx", function (d) {
                if (options.startPos) {
                    return options.startPos.x;
                } else {
                    return x(d.total);
                }
            })
            .attr("cy", function (d) {
                if (options.startPos) {
                    return options.startPos.y;
                } else {
                    return y(d.percentageOfSuccess);
                }
            })
            .attr("r", function (d) {
                // add half the circle stroke width
                if (RADIAL_SCALE) {
                    return radius(d.total) + 1;
                } else {
                    return 10;
                }

            })
            .on("mouseover", function(d, i) {
                if (!options.isDetail) {
                    d3.select(this)
                        .style("stroke-width", "2")
                        .style("stroke", "#f00")
                        .style("cursor", "pointer");
                }
            })
            .on("mouseout", function(d, i) {
                if (!options.isDetail) {
                    d3.select(this)
                        .style("stroke-width", "1")
                        .style("stroke", options.strokeColour || "#fff");
                }
            })
            .on("click", function(d, i) {
                if (!options.isDetail) {
                    // redraw self
                    var format = d.formatName.replace(/\s+/, "-").toLowerCase();
                    GOVUK.Insights.successForFormat(format, {x:x(d.total), y:y(d.percentageOfSuccess)});
                    GOVUK.Insights.selectFormat(format);
                }
            })
        .transition()
        .duration(500)
            .style("opacity", 0.7)
        .transition()
        .duration(function() {
            return (Math.random() * 500) + 300;
        })
            .attr("cx", function(d) {
                return x(d.total);
            })
            .attr("cy", function(d) {
                return y(d.percentageOfSuccess);
            });

    };

    var drawAxis = function (graph) {
        // Draw grid lines
        var xaxis = graph.append("g")
            .attr("class", "x axis");

        xaxis.append("line")
            .attr("class", "domain")
            .attr("x1", WIDTH / 2)
            .attr("x2", 0)
            .attr("y1", HEIGHT / 2)
            .attr("y2", HEIGHT / 2)
            .attr("style", "stroke-dashoffset: 2px");

        xaxis.append("line")
            .attr("class", "domain")
            .attr("x1", WIDTH / 2)
            .attr("x2", WIDTH)
            .attr("y1", HEIGHT / 2)
            .attr("y2", HEIGHT / 2);

        var yaxis = graph.append("g")
            .attr("class", "y axis");

        yaxis.append("line")
            .attr("class", "domain")
            .attr("x1", WIDTH / 2)
            .attr("x2", WIDTH / 2)
            .attr("y1", HEIGHT / 2)
            .attr("y2", 0);
        yaxis.append("line")
            .attr("class", "domain")
            .attr("x1", WIDTH / 2)
            .attr("x2", WIDTH / 2)
            .attr("y1", HEIGHT / 2)
            .attr("y2", HEIGHT)
            .attr("style", "stroke-dashoffset: 2px");

        var drawTickLabels = function (graph) {
            // Place X axis tick labels
            graph.append("svg:text")
                .text("Least used")
                .attr("class", "label-x-left")
                .attr("x", 0)
                .attr("y", HEIGHT / 2 + 9)
                .attr("dy", ".71em");

            graph.append("svg:text")
                .text("Most used")
                .attr("class", "label-x-right")
                .attr("x", WIDTH)
                .attr("y", HEIGHT / 2 + 9)
                .attr("dy", ".71em");

            // Place Y axis tick labels
            panel.append("svg:text")
                .text("More successful")
                .attr("class", "title-y")
                .attr("y", 5)
                .attr("x", WIDTH / 2 + GUTTER_X)
                .attr("dy", ".35em");

            panel.append("svg:text")
                .text("Less successful")
                .attr("class", "title-y")
                .attr("y", HEIGHT + 40) // calculate how high it should be
                .attr("x", WIDTH / 2 + GUTTER_X)
                .attr("dy", ".35em");

            graph.append("rect")
                .attr("height", 12)
                .attr("width", 12)
                .attr("y", HEIGHT - 6)
                .attr("x", WIDTH / 2 + 7)
                .attr("style", "fill: #BF1E2D");

            graph.append("rect")
                .attr("height", 12)
                .attr("width", 12)
                .attr("y", -6)
                .attr("x", WIDTH / 2 + 7)
                .attr("style", "fill: #74B74A");
        };
        drawTickLabels(graph);
    };

    var drawLabels = function (graph) {
        graph
            .selectAll("text.circle-format")
            .data(values)
            .enter().append("svg:text")
            .text(function (d) {
                return d.formatName;
            })
            .attr("class", "circle-format")
            .attr("text-anchor", "middle")
            .attr("x", function (d) {
                return x(d.total);
            })
            .attr("y", function (d) {
                return y(d.percentageOfSuccess) + radius(d.total) + 15;
            })
            .attr("dy", ".35em");
    };


    var drawLegend = function () {
        var estimatedWidthOfLegendText = 80;
        var dataForLegend = x.ticks(4).slice(1, 4);

        if (dataForLegend.length > 2) dataForLegend = dataForLegend.slice(0,2);

        var maxCircleRadius = radius(dataForLegend.slice(-1));

        var legend = d3.select("#format-success-legend")
            .append("svg")
            .attr("width", 180)
            .attr("height", 80)
            .append("g")
            .attr("transform", "translate(" + (maxCircleRadius + estimatedWidthOfLegendText) + ", 3)");

        legend
            .selectAll("circle.legend")
            .data(dataForLegend)
            .enter().append("svg:circle")
            .attr("class", "legend")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("cx", function () {
                return maxCircleRadius;
            })
            .attr("cy", function (d) {
                return radius(d);
            })
            .attr("r", function (d) {
                return radius(d);
            });

        legend
            .selectAll("text.circle-legend")
            .data(dataForLegend)
            .enter().append("svg:text")
            .attr("class", "circle-legend")
            .attr("x", -5)
            .attr("y", function (d, index) {
                return 2*radius(d) - 5; // offset text to bottom of circles
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function (d) {
                return GOVUK.Insights.formatNumericLabel(d) + " times used";
            });
    };

    // - Actually draw the graph -
    plotData(graph);
    drawAxis(graph);
    drawLabels(graph);
    if (!options.hideKey) {
        drawLegend();
    }

};

// register with jQuery's autorun.
$(GOVUK.Insights.formatSuccess);
