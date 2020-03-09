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
  selectedtag = "business";
// var color = d3.scaleOrdinal()

var parSvg = d3.select("#parallel")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

function brushstart() {
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
      // retag = d3.event.selection.map(tag.invert);
      // console.log(retag);
  //

    //set un-brushed foreground line disappear
    foreground.classed("fade", function(d,i) {
        return !actives.every(function(active) {
          console.log("fade");
            var dim = active.dimension;
            return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim])  <= active.extent[1];
        });
    });

  // // // set un-brushed foreground line disappear
  // foreground.style('display', function(d) {
  //   return actives.every(function(active) {
  //     console.log("here");
  //     var dim = active.dimension;
  //     return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
  //   }) ? null : 'none';
  // });
}
var filteryear = "2007",
  filtermonth = "Jan";

function drawParallel(filteryear, filtermonth) {
  d3.csv("./data/ted_main.csv", function(error, data) {
    if (error) throw error;

    //clear all parSvg
    parSvg.selectAll("*").remove();

    //this will remove the unnecessary data indee that won't be used in parallel coordinates
    newdata = d3.keys(data[0]).filter(function(d) { return d != "film_date" && d != "published_date" && d != "tags"  && d != "year" && d != "month" && d != "name" && d != "url"})
    // console.log(newdata);

    // filter the data to only get the data for the following years, month, and tags
    data = data.filter(d => ((d.year === filteryear) && (d.month == filtermonth)) )

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
    // add tag to the tag variable and then parse it using JSON.
    data.forEach(function(d) {
      // unixtime = new Date(d.published_date*1000);
      // year.push(unixtime.getFullYear());
      // month.push(months_arr[unixtime.getMonth()]);
      tag.push(JSON.parse(d.tags.replace(/'/g, "\"")));
    })
    console.log(tag[0][3]);

    // set the domain for x
    x.domain(newdata)

    // Finds the path
    function path(d) {
      return d3.line()(newdata.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    var click = false;
    // console.log(tag[0].length);
    // Draw the lines
    foreground = parSvg.append("g")
      .attr("class", "foreground")
      .selectAll(".parpath")
      .data(data)
      .enter().append("path")
      // .filter(function(d) {
      //   for(var i = 0; i < tag.length; i++) {
      //     for (var j = 0; j < tag[i].length; j++) {
      //       if (selectedtag != undefined) {
      //         console.log(tag[i][j]);
      //         return (tag[i][j] === selectedtag);
      //       } else {
      //         return (tag[i][j]);
      //       }
      //     }
      //   }
      // })
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke-width", 3)
      .style("stroke", function(d,i) { return parcolor(i) })
      .on("click", function(d) {
        if (!click) {
          console.log("workds");
          d3.select(this.parentNode).selectAll("path").style("opacity", 0.2)
          d3.select(this).style("opacity", 1)
          click = true;
          }
        else {
          console.log("asdfasd");
          d3.select(this.parentNode).selectAll("path").style("opacity", 1)
          d3.select(this).style("opacity", 1)
          click = false;
        }
      })
      .append("title")
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
        // .scale(y[d]));
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


  })
}

drawParallel(filteryear, filtermonth);
