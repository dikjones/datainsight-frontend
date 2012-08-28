$.ajax({
    url: '/format-success.json',
    success: function (data) {
        values =
            data
                .map(function(format_events) {
                    return {
                        x: format_events["events"]["total"],
                        y: format_events["events"]["percentageOfSuccess"],
                        label: format_events["format"],
                        size: 20,
                        color: "#2B60DE"
            };
                })

        var minvalx = d3.min(data, function (format_data) {  return format_data["events"]["total"]; })
        var maxvalx = d3.max(data, function (format_data) {  return format_data["events"]["total"]; })

        var minvaly = d3.min(data, function (format_data) {  return format_data["events"]["percentageOfSuccess"]; })
        maxvaly = d3.max(data, function (format_data) {  return format_data["events"]["percentageOfSuccess"]; })

        w = 815,
            h = 500,
            p = 80,
            x = d3.scale.linear().domain([ 0, maxvalx]).range([0, w]),
            y = d3.scale.linear().domain([ minvaly, maxvaly ]).range([h, 0]);

        var vis = d3.select("#format-success")
            .data(values)
            .append("svg:svg")
            .attr("width", w + p * 2)
            .attr("height", h + p * 2)
            .append("svg:g")
            .attr("transform", "translate(" + p + "," + p + ")");


        var rules = vis.selectAll("g.rule")
            .data(x.ticks(10))
            .enter().append("svg:g")
            .attr("class", "rule");

        // Draw grid lines
        rules.append("svg:line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", 0)
            .attr("y2", h - 1);

        rules.append("svg:line")
            .attr("class", function(d) { return d ? null : "axis"; })
            .data(y.ticks(10))
            .attr("y1", y)
            .attr("y2", y)
            .attr("x1", 0)
            .attr("x2", w - 10);

        // Place axis tick labels
        rules.append("svg:text")
            .attr("x", x)
            .attr("y", h + 15)
            .attr("dy", ".71em")
            .attr("text-anchor", "middle")
            .text(x.tickFormat(10))
            .text(String);

        rules.append("svg:text")
            .data(y.ticks(3))
            .attr("y", y)
            .attr("x", -10)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(y.tickFormat(5));

        // Draw xy scatterplot
        vis.selectAll("circle.line")
            .data(values)
            .enter().append("svg:circle")
            .attr("class", "line")
            .attr("fill", function(d) { return d.color; } )
            .style("opacity", 0.6)
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y) - 5; })
            .attr("r", function(d) { return d.size; })
            .append("svg:title")
            .text(function(d) { return d.label; });
    }});
