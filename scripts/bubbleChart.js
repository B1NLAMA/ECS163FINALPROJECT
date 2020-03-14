var margin2 = {top: 30, right: 10, bottom: 10, left: 0},
  width2 = 600 - margin2.left - margin2.right,
  height2 = 600 - margin2.top - margin2.bottom;

var bubSvg = d3.select("#bubble")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
      .attr("transform", "translate(0,0)");

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
          // if (d.name === brushedtag) {
            included = true;
        }
        return included
      } else {
        return ((d.year === filteryear) && (d.month === filtermonth))
      }

    })

    var tagGroup = [];
    data.forEach(function(d) {
      // console.log(d.tags);
      // console.log(i);
      for (var j = 0; j < d.tags.length; j++) {
        for (var k = 0; k < d.tags.length; k++) {
          // console.log(d.tags[k]);
          // console.log(d.tags[j]);
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

    var json = d3.nest()
      .key(function(d) { return d.name })
      .rollup(function(leaves) { return leaves.length; })
      .entries(tagGroup);

    var pack = d3.pack()
      .size([width2, height2])
      .padding(1.5)

    var root = d3.hierarchy({children: json})
      .sum(function(d) {return d.value})

    var tooltip = d3.select(".bubtooltip");

    var click = [];

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

      var that = [];

    var entering = node.append("circle")
      .attr("r", function(d) {
          return d.r;
      })
      .style("fill", function(d,i) {
        // console.log(d);
          return bubcolor(d.data.value);
      })
      .on("mouseover", function(d) {
        tooltip.style("display", "block");

        //set the initial position of the tooltip
        tooltip.style("left", (d3.event.pageX) +"px");
        tooltip.style("top", (d3.event.pageY + 10) + "px");
        // d3.select(this)
        //             .style("stroke","white")
        //             .style("stroke-width",3);
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
        // if (!d3.select(this).classed("selected")) {
        if (selectedtag.indexOf(d.data.key) === -1) {
          console.log(d3.select(this));
          console.log(this);
          // d3.select(this).classed("selected", true);
          entering.style("opacity", 0.2)
          // if (selectedtag.indexOf(d.data.key) === -1) {
          // allow multiple selection
          that.push(d3.select(this))
            for (var i =0; i < that.length; i++) {
              that[i].style("opacity", 1)
            }
          selectedtag.push(d.data.key);
          drawParallel();
        } else if (selectedtag.indexOf(d.data.key) != -1){
        // else if (d3.select(this).classed("selected")){
          // console.log("goes to else");
          // d3.select(this).classed("selected", false);
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
          click = false;
          drawParallel();

        }
      });

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

       var x = d3.scaleLinear()
         .domain([1, 15])
         .range([50, 600]);

       var xAxis = d3.axisBottom(x)
         .tickSize(12)
         .tickValues(bubcolor.domain())
         .tickFormat(function(d) { return d });

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
