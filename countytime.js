/**
 * Created by spartango on 12/3/14.
 */
// Set the dimensions of the canvas / graph
var margin = {top: 25, right: 40, bottom: 30, left: 40},
    width = 400 - margin.left - margin.right,
    height = 160 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width - margin.left]);
var spendY = d3.scale.linear().range([height, 0]);
var crimeY = d3.scale.linear().range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5).tickFormat(d3.format("d"));

var yAxisLeft = d3.svg.axis().scale(spendY)
    .orient("left").ticks(5);

var yAxisRight = d3.svg.axis().scale(crimeY)
    .orient("right").ticks(5);

var crimeLine = d3.svg.line()
    .x(function (d) {
        return x(d.year);
    })
    .y(function (d) {
        return crimeY(d.crime);
    });

var spendLine = d3.svg.line()
    .x(function (d) {
        return x(d.year);
    })
    .y(function (d) {
        return spendY(d.spend);
    });

var svg = d3.select("#time")
    .append("svg")
    .attr("id", "plot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g");

svg.append("text")
    .attr("x", (width / 2))
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("class", "charttitle")
    .text("Spending vs. Crime");

prepData = function (state, county) {
    var data = [];
    for (var year = 2006; year < 2013; year++) {
        var point = fullData.get(buildDataId(year, state, county));
        if (point) {
            data.push(point);
        }
    }

    return data;
};

renderGraph = function (state, county) {
    var data = prepData(state, county);
    var svg = d3.select("#plot");

    // Scale the range of the data
    x.domain([d3.min(data, function (d) {
        return Math.min(d.year);
    }), d3.max(data, function (d) {
        return Math.max(d.year);
    })]);

    spendY.domain([0, d3.max(data, function (d) {
        return Math.max(d.spend);
    })]);
    crimeY.domain([0, d3.max(data, function (d) {
        return Math.max(d.crime);
    })]);

    svg.append("path")
        .style("stroke", "green")
        .attr("id", "spendline")
        .attr("class", "line")
        .attr("transform", "translate(" + margin.left + " ," + margin.top + ")")
        .attr("d", spendLine(data));

    svg.append("path")
        .style("stroke", "red")
        .attr("class", "line")
        .attr("id", "crimeline")
        .attr("transform", "translate(" + margin.left + " ," + margin.top + ")")
        .attr("d", crimeLine(data));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("id", "leftaxis")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + " ," + margin.top + ")")
        .style("fill", "green")
        .call(yAxisLeft)
        .append("text")
        .attr("class", "axislabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", -margin.left + 2)
        .style("text-anchor", "end")
        .text("Equipment ($)");

    svg.append("g")
        .attr("class", "y axis")
        .attr("id", "rightaxis")
        .attr("transform", "translate(" + width + " ," + margin.top + ")")
        .style("fill", "red")
        .call(yAxisRight)
        .append("text")
        .attr("class", "axislabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", margin.right + 2)
        .style("text-anchor", "end")
        .text("Crimes");

    var delta = (x(2) - x(1));
    var verticalLine = svg.append('rect')
        .attr({
            'x': margin.left - delta / 2,
            'y': margin.top,
            'width': delta,
            'height': height
        })
        .attr('class', 'verticalLine');

};

graphYear = function (year) {
    var delta = (x(2) - x(1));
    if (isNaN(delta))
        return;

    d3.select(".verticalLine")
        .attr({
            'x': margin.left - delta / 2,
            'y': margin.top,
            'width': delta,
            'height': height
        }).attr("transform", function () {
            return "translate(" + x(year) + ",0)";
        });
};

updateGraph = function (state, county) {
    var data = prepData(state, county);

    var svg = d3.select("#plot").transition();
    x.domain([d3.min(data, function (d) {
        return Math.min(d.year);
    }), d3.max(data, function (d) {
        return Math.max(d.year);
    })]);

    spendY.domain([d3.min(data, function (d) {
        return Math.min(d.spend);
    }), d3.max(data, function (d) {
        return Math.max(d.spend);
    })]);
    crimeY.domain([d3.min(data, function (d) {
        return Math.min(d.crime);
    }), d3.max(data, function (d) {
        return Math.max(d.crime);
    })]);

    svg.select("#crimeline")
        .duration(250)
        .attr("d", crimeLine(data));
    svg.select("#spendline")
        .duration(250)
        .attr("d", spendLine(data));

    svg.select(".x.axis")
        .duration(250)
        .call(xAxis);
    svg.select("#leftaxis")
        .duration(250)
        .call(yAxisLeft);
    svg.select("#rightaxis")
        .duration(250)
        .call(yAxisRight);

    graphYear(year)
};