/**
 * Created by spartango on 12/3/14.
 */
var w = window.innerWidth,
    h = 0.75 * window.innerHeight;

var scheme = colorbrewer.RdYlGn[9].reverse();
var fullData = d3.map();

var year = 2006;
var currentState = "California";

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([w / 2, h / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h);

var states = svg.append("svg:g")
    .attr("id", "states");

fetchData = function () {
    fullData = d3.map();

    d3.tsv("StateBreakdown.tsv", function (d) {
        d.forEach(function (entry) {
            fullData.set(entry.id, {
                "year": entry.year,
                "state": entry.state,
                "crime": +entry.crime,
                "crime_rate": +entry.crime_rate,
                "spend_rate": +entry.spend_rate,
                "spend": +entry.spend,
                "population": +entry.population,
                "ratio": +entry.ratio
            });
        });
        displayData();
        renderGraph("California")
    });
};

updateStats = function (state) {
    d3.select("#state").text(state);
    var data = fullData.get(state + "::" + year);
    d3.select("#population").text(numeral(data.population).format("0,0"));
    d3.select("#crime").text(numeral(data.crime).format("0,0[.][000000]"));
    d3.select("#spend").text(numeral(data.spend).format("$0,0.00[0000]"));
    //var color = genColors();
    d3.select("#ratio")
        //.style("color", color(data.ratio))
        .text(numeral(data.ratio).format("0.00[0000]"));
};


renderStates = function () {
    d3.json("us-states.json",
        function (statelines) {
            console.log("States loaded");

            //window.countylines = countylines;
            window.statelines = statelines;

            //if (error) throw error;

            var stateIds = {};
            statelines.features.forEach(function (d) {
                stateIds[d.id] = d.properties.name;
            });

            //countylines.features.forEach(function (d) {
            //    d.properties.state = stateIds[d.id.slice(0, 2)];
            //});

            states.selectAll("path")
                .data(statelines.features)
                .enter().append("svg:path")
                .attr("d", path)
                .attr("id", function (d) {
                    return codeForState(d.properties.name);
                })
                .on("mouseover", function (d, i) {
                    currentState = d.properties.name;
                    updateStats(currentState);
                    updateGraph(currentState);
                });

            d3.select("body")
                .on("keydown", function () {
                    var key = d3.event.keyCode;
                    if (key == 37) {
                        previousYear();
                    } else if (key == 39) {
                        nextYear();
                    }
                });
            fetchData();
        });
};

var genColors = function () {
    var values = [];
    fullData.forEach(function (key, value) {
        if (value.year == year) {
            values.push(value.ratio);
        }
    });

    var min = 0;
    var max = 2 * ss.median(values);

    var colorizer = d3.scale.quantize()
        .domain([min, max])
        .range(scheme);

    return colorizer;
};

var displayData = function () {
    d3.select("#year").text(year);
    var svg = d3.select("body").transition();
    var color = genColors();

    fullData.forEach(function (key, value) {
        if (value.year == year) {
            var state = value.state;
            var ratio = value.ratio;
            svg.select("#" + codeForState(state))
                .style("fill", function (d) {
                    return color(ratio);
                }).attr("value", function (d) {
                    return ratio;
                });
        }
    });

    updateStats(currentState);
};

function setYear(newYear) {
    year = newYear;
    if (year > 2012) {
        year = 2006;
    } else if (year < 2006) {
        year = 2012;
    }
    displayData();
    graphYear(year);
    console.log("Switching to " + year);
}

function nextYear() {
    setYear(year + 1);
};

function previousYear() {
    setYear(year - 1);
};

renderStates();

