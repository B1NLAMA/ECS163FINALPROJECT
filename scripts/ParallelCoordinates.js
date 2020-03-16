var margin1 = {top: 30, right: 10, bottom: 10, left: 0},
  width1 = 800 - margin1.left - margin1.right,
  height1 = 400 - margin1.top - margin1.bottom;

var x2 = d3.scalePoint()
    .range([0, width1])
    .padding(1),
    y2 = {};

// add color for the frequency and tags
var parcolor = d3.scaleOrdinal(d3.schemeCategory10);

var selectedtag = [],
  brushedtag = [],
  freq = []; // will tell you what frequencies are present.

var parSvg = d3.select("#parallel")
    .append("svg")
        .attr("width", width1 + margin1.left + margin1.right)
        .attr("height", height1 + margin1.top + margin1.bottom)
    .append("g")
        .attr("transform",
        "translate(" + margin1.left + "," + margin1.top + ")");

var filteryear = "2010",
    filtermonth = "Feb";
// This will filter
function filterForParallel(date){
  console.log(date);
  var filter = date.split("-");
  if(+filter[1] === 01){
    filtermonth = "Jan";
  }
  else if(+filter[1] === 02){
    filtermonth = "Feb";
  }
  else if(+filter[1] === 03){
    filtermonth = "Mar";
  }
  else if(+filter[1] === 04){
    filtermonth = "Apr";
  }
  else if(+filter[1] === 05){
    filtermonth = "May";
  }
  else if(+filter[1] === 06){
    filtermonth = "Jun";
  }
  else if(+filter[1] === 07){
    filtermonth = "Jul";
  }
  else if(+filter[1] === 08){
    filtermonth = "Aug";
  }
  else if(+filter[1] === 09){
    filtermonth = "Sep";
  }
  else if(+filter[1] === 10){
    filtermonth = "Oct";
  }
  else if(+filter[1] === 11){
    filtermonth = "Nov";
  }
  else{
    filtermonth = "Dec";
  }

  filteryear = filter[0];
  drawParallel(); //with new month, year
  bubbleChart();
}

function drawParallel() {
  d3.csv("./data/ted_main.csv", function(error, data) {
    if (error) throw error;

    console.log("filter year: ", filteryear);
    console.log("filter month: ", filtermonth);
    
    //clear all parSvg
    parSvg.selectAll("*").remove();

    //this will remove the unnecessary data indee that won't be used in parallel coordinates
    newdata = d3.keys(data[0]).filter(function(d) { return d != "film_date" && d != "film_date" && d != "tags"  && d != "year" && d != "month" && d != "name" && d != "url" && d != "date"})

    // adding a new data that will have a frequency of the talk
    var json = d3.nest()
      .key(function(d) { return d.name })
      .rollup(function(leaves) { return leaves.length; })
      .entries(data);

    // add tag to the tag variable and then parse it using JSON.
    data.forEach(function(d) {
      d.tags = (JSON.parse(d.tags.replace(/'/g, "\"")));
      json.forEach(function(e) {
        if (d.name === e.key){
          d.frequency = e.value
        }
      })
    })

    // filter the data to only get the data for the following years, month, and tags
    // if the tags are in the array, it will include the array
    data = data.filter(function(d) {
      if (selectedtag.length != 0) {
        var included = false;
        for(var i= 0; i < d.tags.length; i++) {
          if ((selectedtag.indexOf(d.tags[i])) != -1) {
            included = true;
          }
        }
        
        return ((d.year === filteryear) && (d.month === filtermonth)) && included
      } else {
        return ((d.year === filteryear) && (d.month === filtermonth))
      }

    })

    // this will have the dimensions of the axis
    newdata.forEach(function(d) {
      y2[d] = d3.scaleLinear()
        .domain( d3.extent(data, function(p) { return +p[d]; }) )
        .range([height1, 0]);

      // this will call the brush
      y2[d].brush = d3.brushY()
        .extent([[-5, y2[d].range()[1]], [5, y2[d].range()[0]]])
        .on("start", brushstart)
        .on("brush", brush)

    })

    // set the domain for x
    x2.domain(newdata)

    // Finds the path
    function path(d) {
      return d3.line()(newdata.map(function(p) { return [x2(p), y2[p](d[p])]; }));
    }

    var click = false;

    var tooltip = d3.select(".partooltip");
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    var content = document.getElementById("content");

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
        if(selectedtag.length != 0) {
          for(var i= 0; i < d.tags.length; i++) {
            if ((selectedtag.indexOf(d.tags[i])) != -1) {
              return parcolor(d.tags[i])
            }
          }
        } else {
            if (freq.indexOf(d.frequency) === -1) {
              freq.push(d.frequency)
            }
          return parcolor(d.frequency)
        }

      })
      .on("mouseover", function(d) {
        tooltip.style("display", "block");

        //set the initial position of the tooltip
        tooltip.style("left", (d3.event.pageX) +"px");
        tooltip.style("top", (d3.event.pageY + 10) + "px");
        // d3.select(this)
        //             .style("stroke","white")
        //             .style("stroke-width",3);
        tooltip.html("<strong>Name: </strong>" + d.name + "<br>"
        + "<strong> # talks: </strong>" + d.frequency);
      })
      .on("mousemove", function(d) {
        tooltip.style("left", (d3.event.pageX) +"px");
        tooltip.style("top", (d3.event.pageY + 10) + "px");
      })
      .on("mouseleave", function(d) {
        tooltip.style("display", "none");
      })
      .on("click", function(d) {
        if (!click) {
          console.log("workds");
          console.log(d);
          modal.style.display = "block";
          d3.select("p").text(d.url);
          // alert(d.url)
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

    // when the X is clicked on the modal, this is triggered.
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    // group them together
    var axes = parSvg.selectAll(".newdata")
      .data(newdata)
      .enter().append("g")
      .attr("class", "newdata")
      .attr("transform", function(d) { return "translate(" + x2(d) + ")"; });

    // make a axis and title
    parSvg.selectAll("myaxis")
      .data(newdata).enter()
      .append("g")
      // translate this element to its right position on the x axis
      .attr("transform", function(d) { return "translate(" + x2(d) + ")"; })
      // build the axis
      .each(function(d) { d3.select(this)
        .call(d3.axisLeft(y2[d]))
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
      .each(function(d) { d3.select(this).call(y2[d].brush); })
      .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

    // at the beginning of the brush, it will keep track of the bursh.
    function brushstart() {
      // This will add the pixel and dimension of the y-axis that is brushed
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

      // This will call bubble chart and clear the fade when the bursh is removed.
      actives.every(function(d) {
        // when you click out to remove the brush this if statement is exe
        if (d.extent[0] === d.extent[1]) {
          // make brushedtag undefiend so that we can reset the bubble chart
          brushedtag = [];
          bubbleChart();
          // change class of non selected lines so that they have opacity of 1
          foreground.classed("fade", false);

        }
      })
      d3.event.sourceEvent.stopPropagation();
    }

    function brush() {

      // it will store the active range that the bursh is covering
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

        // this will provide the range of the comments
        var comment = d3.event.selection.map(y2["comments"].invert)
        // var duration = d3.event.selection.map(y["duration"].invert)
        // var languages = d3.event.selection.map(y["languages"].invert)
        // var views = d3.event.selection.map(y["views"].invert)
        // console.log(duration);
        // console.log(comment[1]);
        // changeTag(comment, duration, languages, views);

        // call a function that will add a new tag to the burshed tag variable
        changeTag(comment);

        // make a new bubble chart

        //set un-brushed foreground line disappear
        foreground.classed("fade", function(d,i) {
          return !actives.every(function(active) {
            var dim = active.dimension;
            var included = active.extent[0] <= y2[dim](d[dim]) && y2[dim](d[dim])  <= active.extent[1];
            return included
          });
        });
        bubbleChart();

    }

    // function changeTag(comment, duration, languages, views) {
    function changeTag(comment) {

      // add a filtered data that is filtered by the range of comments into a temp var
      var faketag = data.filter(function(d) {
        // bunch of bugs that I cannot fix right now
        // if (comment.length != 0 && duration.length != 0 && languages.length != 0 && views.length != 0) {
        //   return (((d.comments >= comment[1]) && (d.comments <= comment[0])) || ((d.duration >= duration[1]) && (d.duration <= duration[0]))
        //     || ((d.languages >= languages[1]) && (d.languages <= languages[0])) || ((d.views >= views[1]) && (d.views <= views[0])))
        // }
        // if (comment.length != 0){
        //   return ((d.comments >= comment[1]) && (d.comments <= comment[0]))
        // } else if (duration.length != 0) {
        //   return ((d.duration >= duration[1]) && (d.duration <= duration[0]))
        // } else if (languages.length != 0) {
        //   return ((d.languages >= languages[1]) && (d.languages <= languages[0]))
        // } else if (views.length != 0) {
        //   return ((d.views >= views[1]) && (d.views <= views[0]))
        // }
        return ((d.comments >= comment[1]) && (d.comments <= comment[0]))
      })

      // go through all the temp var and then add its tags into the burshedtag var so that we can use its info to change the bubble chart.
      faketag.forEach(function(d) {
        brushedtag.push(d.name);
      })
    }

    // adding a legend
    if (selectedtag.length != 0) {
      // only add when there is a tag filter
      var legend = parSvg.selectAll("legend")
        .data(selectedtag)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
          return "translate(10," + (i *20 + 250) + ")";
        });

      // add a rectangle with color for the legend
      legend.append("rect")
        .attr("class", String)
        .attr("x", 40)
        .attr("y", -4)
        .attr("width", 5)
        .attr("height", 5)
        .attr("fill", function(d,i) {
              return parcolor(selectedtag[i])
        });

      // adding a text for the legend
      legend.append("text")
        .attr("x", 52)
        .attr("dy", ".31em")
        .text(function(d) { return d; });
    } else {
      // only use this when there is no tag filter
      var legend = parSvg.selectAll("legend")
        .data(freq)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
          return "translate(10," + (i *20 + 250) + ")";
        });

      // add a rectangle with color for the legend
      legend.append("rect")
        .attr("class", String)
        .attr("x", 40)
        .attr("y", -4)
        .attr("width", 5)
        .attr("height", 5)
        .attr("fill", function(d, i) {
          return parcolor(freq[i])
      });

      // adding a text for the legend
      legend.append("text")
        .attr("x", 52)
        .attr("dy", ".31em")
        .text(function(d) { return d; });
    }
  })
}

drawParallel();
