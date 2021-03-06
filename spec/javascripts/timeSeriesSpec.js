describe("time series helper", function() {
    describe("months_range", function() {
        it("should produce correct range for mid month", function() {
            var start = new Date(2011, 1, 10),
                end   = new Date(2011, 7, 15),
                step  = 2;
            expect(GOVUK.Insights.months_range(start, end, step)).toEqual(
                [new Date(2011, 1, 15), new Date(2011, 3, 15), new Date(2011, 5, 15), new Date(2011, 7, 15)]
            );
        });

        it("should produce correct range for end of month", function() {
            var start = new Date(2012, 0, 30),
                end   = new Date(2012, 6, 30),
                step  = 2;
            expect(GOVUK.Insights.months_range(start, end, step)).toEqual(
                [new Date(2012, 0, 30), new Date(2012, 2, 30), new Date(2012, 4, 30), new Date(2012, 6, 30)]
            );
        });

        it("should produce correct range for end of year", function() {
            var start = new Date(2012, 11, 30),
                end   = new Date(2013, 5, 30),
                step  = 2;
            expect(GOVUK.Insights.months_range(start, end, step)).toEqual(
                [new Date(2012, 11, 30), new Date(2013, 1, 28), new Date(2013, 3, 30), new Date(2013, 5, 30)]
            );
        });

        it("should return date range that goes until last Sunday from a day 6 months ago of it", function() {
            var dateRange =
                GOVUK.Insights.sixMonthTimeSeries(null, {}).dateRange(moment("20120922", "YYYYMMDD"))
                    .map(function (each) { return each.toGMTString()});

            expect(dateRange)
                .toEqual(
                    [moment("20120316", "YYYYMMDD").toDate().toGMTString(),
                     moment("20120916", "YYYYMMDD").toDate().toGMTString()]);
        });
    });

    describe("findClosestDataPoint", function() {
        it("should find the closest data point", function() {
            var mousePoint = GOVUK.Insights.point(12, 32),
                data = {
                    "aSeries": [[10,12], [12, 33], [14, 18]],
                    "anotherSeries": [[10,0], [12, 5], [14, 3]]
                },
                getDataPoint = function(d) {
                    return GOVUK.Insights.point(d);
                };

            var closest = GOVUK.Insights.findClosestDataPoint(mousePoint, data, getDataPoint);
            expect(closest.dataPoint.x()).toEqual(12);
            expect(closest.dataPoint.y()).toEqual(33);
            expect(closest.seriesName).toBe("aSeries");
            expect(closest.datum).toEqual([12, 33]);
        });
        
        it("should return a point in the last matching series when there are multiple matches", function () {
            var mousePoint = GOVUK.Insights.point(10,10);
            data = {
                "one": [[10,12]],
                "two": [[10,8]],
            };
            getDataPoint = function(d) {
                return GOVUK.Insights.point(d);
            };
            
            var closest = GOVUK.Insights.findClosestDataPoint(mousePoint, data, getDataPoint);
            expect(closest.seriesName).toBe("two");            
        });
        
        it("should bias point detection towards the a given series", function () {
            var mousePoint = GOVUK.Insights.point(10,10);
            data = {
                "one": [[10,12]],
                "two": [[10,8]],
            };
            getDataPoint = function(d) {
                return GOVUK.Insights.point(d);
            };
            
            var closest = GOVUK.Insights.findClosestDataPoint(mousePoint, data, getDataPoint, "one");
            expect(closest.seriesName).toBe("one");            
        });
        
        it("should return closest point if preferred series has no point close enough", function () {
            var mousePoint = GOVUK.Insights.point(10,10);
            data = {
                "one": [[10,20]],
                "two": [[10,8]],
            };
            getDataPoint = function(d) {
                return GOVUK.Insights.point(d);
            };
            
            var closest = GOVUK.Insights.findClosestDataPoint(mousePoint, data, getDataPoint, "one");
            expect(closest.seriesName).toBe("two");            
        });
    });
});
