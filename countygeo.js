/**
 * Created by spartango on 12/3/14.
 */
var w = window.innerWidth,
    h = 0.75 * window.innerHeight;

var scheme = colorbrewer.RdYlGn[9].reverse();
var fullData = d3.map();

var year = 2012;
var currentCounty = "Los Angeles";
var currentState = "CA";

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

var buildDOMId = function (state, county) {
    return codeForState(state) + "_" + county.replace(" ", "_").replace(".", "");
};

var buildDataId = function (year, state, county) {
    return year + "::" + state + "::" + county;
};

fetchData = function () {
    fullData = d3.map();

    d3.tsv("CountyBreakdown.tsv", function (d) {
        d.forEach(function (entry) {
            var id = buildDataId(entry.year, stateForCode(entry.state), entry.county);
            fullData.set(id, {
                "county": entry.county,
                "year": entry.year,
                "state": stateForCode(entry.state),
                "crime": +entry.crime,
                "crime_rate": 0,//+entry.crime_rate,
                "spend_rate": 0,//+entry.spend_rate,
                "spend": +entry.spend,
                "population": 0,//+entry.population,
                "ratio": +entry.ratio
            });
        });
        displayData();
        renderGraph(currentState, currentCounty);
    });
};

updateStats = function () {
    var id = buildDataId(year, currentState, currentCounty);
    d3.select("#state").text(currentCounty + ", " + codeForState(currentState));

    var data = fullData.get(id);
    if (data) {
        //d3.select("#population").text(numeral(data.population).format("0,0"));
        d3.select("#crime").text(numeral(data.crime).format("0,0[.][000000]"));
        d3.select("#spend").text(numeral(data.spend).format("$0,0.00[0000]"));
        //var color = genColors();
        d3.select("#ratio")
            //.style("color", color(data.ratio))
            .text(numeral(data.ratio).format("0.00[0000]"));
    } else {
        d3.select("#crime").text("");
        d3.select("#spend").text("");
        d3.select("#ratio").text("");
    }

};

var centered;

clicked = function (d) {
    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = w / 2;
        y = h / 2;
        k = 1;
        centered = null;
    }

    states.selectAll("path")
        .classed("active", centered && function (d) {
            return d === centered;
        });

    states.transition()
        .duration(750)
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
};

renderStates = function () {
    d3.json("us-counties.json", function (countylines) {
        console.log("Counties loaded");

        d3.json("us-states.json",
            function (statelines) {
                console.log("States loaded");

                window.countylines = countylines;
                window.statelines = statelines;

                //if (error) throw error;

                var stateIds = {};
                statelines.features.forEach(function (d) {
                    stateIds[d.id] = d.properties.name;
                });

                countylines.features.forEach(function (d) {
                    d.properties.state = stateIds[d.id.slice(0, 2)];
                });

                states.selectAll("path")
                    .data(countylines.features)
                    .enter().append("svg:path")
                    .attr("d", path)
                    .attr("id", function (d) {
                        return buildDOMId(d.properties.state, d.properties.name);
                    })
                    .on("mouseover", function (d, i) {
                        currentCounty = d.properties.name;
                        currentState = d.properties.state;
                        updateStats();
                        updateGraph(currentState, currentCounty);
                    }).on("click", clicked);

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
    });
};

var genColors = function () {
    var values = [];
    fullData.forEach(function (key, value) {
        if (value.year == year) {
            values.push(value.ratio);
        }
    });

    var min = Math.max(ss.min(values), .1);
    var max = ss.max(values);

    return d3.scale.log()
        .domain([min, max])
        .range(["green", "red"])
};

var displayData = function () {
    d3.select("#year").text(year);
    var svg = d3.select("body").transition();
    var color = genColors();

    fullData.forEach(function (key, value) {
        if (value.year == year) {
            var county = value.county;
            var state = value.state;
            var ratio = value.ratio;
            svg.select("#" + buildDOMId(state, county)).
                style("fill", function (d) {
                    return color(ratio);
                }).attr("value", function (d) {
                    return ratio;
                });
        }
    });

    updateStats();
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
}
function previousYear() {
    setYear(year - 1);
}
renderStates();

