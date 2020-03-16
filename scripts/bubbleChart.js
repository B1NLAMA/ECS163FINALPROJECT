var margin3 = {top: 30, right: 10, bottom: 10, left: 0},
  width3 = 400 - margin3.left - margin3.right,
  height3 = 400 - margin3.top - margin3.bottom;

var bubSvg = d3.select("#bubble")
    .attr("width", width3 + margin3.left + margin3.right)
    .attr("height", height3 + margin3.top + margin3.bottom)
    .append("g")
      .attr("transform", "translate(0,0)");

// Color with choropleth
var bubcolor = d3.scaleThreshold()
    .domain([1, 2, 3, 5, 7, 10, 15])
    .range(["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f"]);

function bubbleChart() {
  d3.csv("./data/ted_main.csv", function(error, data) {

    //clear all parSvg
    bubSvg.selectAll("*").remove();

    data.forEach(function(d) {
      d.tags = (JSON.parse(d.tags.replace(/'/g, "\"")));
    })

    // filter the data to only get the data for the following years, month, and tags
    // if the tags are in the array then it will basicall get all the tags data from the array
    data = data.filter(function(d) {
      if (brushedtag.length != 0) {
        var included = false;
        if ((brushedtag.indexOf(d.name)) != -1) {
            included = true;
        }
        return included
      } else {
        return ((d.year === filteryear) && (d.month === filtermonth))
      }

    })

    // an array that will contain all the tags.
    var tagGroup = [];

    // add all the tags to the taggroup array.
    data.forEach(function(d) {
      for (var j = 0; j < d.tags.length; j++) {
        for (var k = 0; k < d.tags.length; k++) {
          if (d.tags[j] === d.tags[k]) {
            tagGroup.push(
              {
                name: d.tags[j],
              }
            )
          }
        }
      }
    })

    // get the frequency and name of the tags.
    var json = d3.nest()
      .key(function(d) { return d.name })
      .rollup(function(leaves) { return leaves.length; })
      .entries(tagGroup);

    // pack all the data so that it can be used.
    var pack = d3.pack()
      .size([width3, height3])
      .padding(1.5)

    // make a hierarchy in the data
    var root = d3.hierarchy({children: json})
      .sum(function(d) {return d.value})

    // add a tooltips
    var tooltip = d3.select(".bubtooltip");

    var node = bubSvg.selectAll(".presentor")
      .data(pack(root).descendants())
      .enter()
      .filter(function(d) {
        return !d.children
      })
      .append("g")
      .attr("class", "root")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })

    // will contain object of tags that are selected
    var that = [];

    var entering = node.append("circle")
      .attr("r", function(d) {
          return d.r;
      })
      .style("fill", function(d,i) {
          return bubcolor(d.data.value);
      })
      .on("mouseover", function(d) {
        tooltip.style("display", "block");

        //set the initial position of the tooltip
        tooltip.style("left", (d3.event.pageX) +"px");
        tooltip.style("top", (d3.event.pageY + 10) + "px");
        tooltip.html("<strong>Tag: </strong>" + d.data.key + "<br>"
        + "<strong>Frequency: </strong>" + d.data.value);
      })
      .on("mousemove", function(d) {
        tooltip.style("left", (d3.event.pageX) +"px");
        tooltip.style("top", (d3.event.pageY + 10) + "px");
      })

      .on("mouseleave", function(d) {
        tooltip.style("display", "none");
      })
      .on("click", function(d, i) {
        if (selectedtag.indexOf(d.data.key) === -1) {
          console.log(d3.select(this));
          console.log(this);
          entering.style("opacity", 0.2)
          // allow multiple selection
          that.push(d3.select(this))
            for (var i =0; i < that.length; i++) {
              that[i].style("opacity", 1)
            }
          //add to selected tag so that we can filter using the tag.
          selectedtag.push(d.data.key);
          drawParallel();
        } else if (selectedtag.indexOf(d.data.key) != -1) {
          entering.style("opacity", 1)
          d3.select(this).style("opacity", 1)
          selectedtag = selectedtag.filter(function(d, i) {
            var included = false;
            if(selectedtag[i] != d) {
              included = true
            }
            return selectedtag && included
          })
          // remove that multiple selection
          that = that.filter(function(d, i) {
            var included = false;
            if(that[i] != d) {
              included = true
            }
            return that && included
          })
          drawParallel();
        }
      });

    // add a text that shows the name of the tag
    node.append("text")
     .attr("dy", ".2em")
     .style("text-anchor", "middle")
     .text(function(d) {
         return d.data.key;
     })
     // .attr("font-family", "sans-serif")
     .attr("font-size", function(d){
         return d.r/5;
     })
     .attr("fill", "white");

  // Add a value/frequency of tags.
   node.append("text")
     .attr("dy", "2.3em")
     .style("text-anchor", "middle")
     .text(function(d) {
         return d.data.value;
     })
     // .attr("font-family",  "Gill Sans", "Gill Sans MT")
     .attr("font-size", function(d){
         return d.r/5;
     })
     .attr("fill", "white");

    // This will determind how long and how many values should the legend should have.
     var x = d3.scaleLinear()
       .domain([1, 15])
       .range([50, 600]);

    // This is the cuntion that will determine the ticks size and its value.
     var xAxis = d3.axisBottom(x)
       .tickSize(12)
       .tickValues(bubcolor.domain())
       .tickFormat(function(d) { return d });

    // this will add a legend for the bubble chart.
     var g = d3.select("#bubble").append("g");
     g.attr('transform', 'translate(0, 600)')
       .call(xAxis)
       .selectAll("rect")
       .data(bubcolor.range().map(function(data) {
           var d = bubcolor.invertExtent(data);
           if (d[0] == null) d[0] = x.domain()[0];
           if (d[1] == null) d[1] = x.domain()[1];
           return d;
         }))
       .enter().insert("rect", ".tick")
       .attr("height", 10)
       .attr("x", function(d) { return x(d[0]); })
       .attr("width", function(d) { return x(d[1]) - x(d[0]); })
       .attr("fill", function(d) { return bubcolor(d[0])});

  })
}
bubbleChart();
