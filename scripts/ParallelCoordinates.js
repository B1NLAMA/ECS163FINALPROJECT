var margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 900 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var x = d3.scalePoint()
    .range([0, width])
    .padding(1),
    y = {};

// add color for the genders
var parcolor = d3.scaleOrdinal(d3.schemeCategory10);

var tag = [],
  selectedtag = ["business", "health"];
// var color = d3.scaleOrdinal()

var parSvg = d3.select("#parallel")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

function brushstart() {
  var actives = [];
  parSvg.selectAll(".brush")
      .filter(function(d) {
          return d3.brushSelection(this);
      })
      .each(function(d) {
          actives.push({
              dimension: d,
              extent: d3.brushSelection(this)
          });
      });

    actives.every(function(d) {
      if (d.extent[0] === d.extent[1]) {
        foreground.classed("fade", false);
      }
    })
  d3.event.sourceEvent.stopPropagation();
}

function brush() {
  var actives = [];
  parSvg.selectAll(".brush")
      .filter(function(d) {
          return d3.brushSelection(this);
      })
      .each(function(d) {
          actives.push({
              dimension: d,
              extent: d3.brushSelection(this)
          });
      });

    //set un-brushed foreground line disappear
    foreground.classed("fade", function(d,i) {
        return !actives.every(function(active) {
            var dim = active.dimension;
            var included = active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim])  <= active.extent[1];
            return included
        });
    });
}

var filteryear = "2010",
  filtermonth = "Feb";

function drawParallel(filteryear, filtermonth) {
  d3.csv("./data/ted_main.csv", function(error, data) {
    if (error) throw error;

    //clear all parSvg
    parSvg.selectAll("*").remove();

    //this will remove the unnecessary data indee that won't be used in parallel coordinates
    newdata = d3.keys(data[0]).filter(function(d) { return d != "film_date" && d != "film_date" && d != "tags"  && d != "year" && d != "month" && d != "name" && d != "url" && d != "date"})

    // add tag to the tag variable and then parse it using JSON.
    data.forEach(function(d) {
      // unixtime = new Date(d.published_date*1000);
      // year.push(unixtime.getFullYear());
      // month.push(months_arr[unixtime.getMonth()]);
      d.tags = (JSON.parse(d.tags.replace(/'/g, "\"")));
    })

    // filter the data to only get the data for the following years, month, and tags
    data = data.filter(function(d) {
      var included = false;
      for(var i= 0; i < d.tags.length; i++) {
        if ((selectedtag.indexOf(d.tags[i])) != -1) {
          included = true;
        }
      }
      return ((d.year === filteryear) && (d.month === filtermonth)) && included
    })

    // this will have the dimenstions of the axis
    newdata.forEach(function(d) {
      y[d] = d3.scaleLinear()
        .domain( d3.extent(data, function(p) { return +p[d]; }) )
        .range([height, 0]);

      y[d].brush = d3.brushY()
        .extent([[-5, y[d].range()[1]], [5, y[d].range()[0]]])
        .on("start", brushstart)
        .on("brush", brush)

    })

    // set the domain for x
    x.domain(newdata)

    // Finds the path
    function path(d) {
      return d3.line()(newdata.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    var click = false;

    // Draw the lines
    foreground = parSvg.append("g")
      .attr("class", "foreground")
      .selectAll(".parpath")
      .data(data)
      .enter().append("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke-width", 3)
      .style("stroke", function(d,i) {
        for(var i= 0; i < d.tags.length; i++) {
          if ((selectedtag.indexOf(d.tags[i])) != -1) {
            return parcolor(d.tags[i])
          }
        }
      })
      .on("click", function(d) {
        if (!click) {
          console.log("workds");
          d3.select(this.parentNode).selectAll("path").style("stroke-width", 3)
          d3.select(this).style("stroke-width", 6)
          click = true;
          }
        else {
          console.log("asdfasd");
          d3.select(this.parentNode).selectAll("path").style("stroke-width", 3)
          d3.select(this).style("stroke-width", 3)
          click = false;
        }
      });

      foreground.append("title")
        .text(function(d) {
          return d.name;
        })

    // group them together
    var axes = parSvg.selectAll(".newdata")
      .data(newdata)
      .enter().append("g")
      .attr("class", "newdata")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

    // make a axis and title
    parSvg.selectAll("myaxis")
      .data(newdata).enter()
      .append("g")
      // translate this element to its right position on the x axis
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      // build the axis
      .each(function(d) { d3.select(this)
        .call(d3.axisLeft(y[d]))
      })
      // Add axis title
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

    // make the brush
    axes.append("g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush); })
      .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

    // adding a legend
    var legend = parSvg.selectAll("legend")
      .data(selectedtag)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        return "translate(10," + (i *20 + 250) + ")";
      });

    legend.append("rect")
      .attr("class", String)
      .attr("x", 40)
      .attr("y", -4)
      .attr("width", 5)
      .attr("height", 5)
      .attr("fill", function(d,i) {
            return parcolor(selectedtag[i])
      });

    legend.append("text")
      .attr("x", 52)
      .attr("dy", ".31em")
      .text(function(d) { return d; });


  })
}

drawParallel(filteryear, filtermonth);
