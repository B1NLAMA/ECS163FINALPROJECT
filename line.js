(function() {
    var svg = d3.select("#vis1"),
        margin = {top: 50, right: 150, bottom: 30, left: 50},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("class", "plot").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //var parseTime = d3.timeParse("%m/%d/%y");

  var x = d3.scaleBand().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
      .curve(d3.curveBasis)
      .x(function(d) { return x(d.key); })
      .y(function(d) { return y(d.value); });

  d3.csv("./data/ted_main.csv", type, function(error, data) {
    if (error) throw error;

    yearlyData = data.filter(function(d){
        return d.year > 2011
    });

      var makes = d3.nest()
          .key(function(d) { return d.year; })
          .key(function(d) { return d.month; })
          .rollup(function(v) { return v.length})
          .entries(yearlyData);
      console.log(makes)

      var filteredMakes = makes.filter(function(d) {
          return d.values.map(function(c) {
              return c.value});
      });

    var keys = filteredMakes.map(function(d) { return d.key; });
    var values = d3.values(filteredMakes).map(function(d) { return d.values.map(function(c) { return c.value; }); });

    keys.sort(function(a,b) { return a.localeCompare(b); });

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //x.domain(d3.extent(yearlyData, function(d) {return d.month; }));
    x.domain(months);
    y.domain([
      d3.min(values, function(array) { return d3.min(array); }),
      d3.max(values, function(array) { return d3.max(array); })
    ]);
    z.domain(keys);


    // Append axes
    g.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Monthly Ted Talks");

    // Append paths
    var make = g.selectAll(".make")
      .data(filteredMakes)
      .enter()
      .append("g")
      .attr("class", "make")
      .attr("id", function(d) { return d.key; })
        /*.on("click", function(d){
            console.log(+d.key)
            calendarView(+d.key);
        });*/


    var transCount = 0;

      function start(data) {
          return line(data.values.map(function (c) {
              return c;
          }))
      }

      make.append("path")
      .attr("class", "line")
      .attr("id", function(d){return 'tag'+d.key.replace(/\s+/g, '')})
      .attr("d", function(c) { return start(c)})
      .style("stroke", function(d) { return z(d.key); })
      .attr("stroke-dasharray", function(d) { return this.getTotalLength() + " " + this.getTotalLength(); })
      .attr("stroke-dashoffset", function(d) { return this.getTotalLength(); })
      .style("stroke-width", 3)
      .on("click", function(d){
          console.log(+d.key)
          calendarView(+d.key);
          filteryear = +d.key;
          drawParallel();
      })

      .each(function() {
         transCount++;
       })
      .transition()
          .duration(5000)
          .ease(d3.easeSin)
          .attr("stroke-dashoffset", 0)

      /*svg.append("text")
          .attr("x", width+55)
          .attr("y", height + margin.top -305)
          .attr("font-weight", "bold")
          .attr("class", "legend")
          .style("fill", "#1f77b4")
          .on("click", function(){
              var filteredLine = make.filter(function(d,i){return i ===2;})
              if (visible == true){
                  filteredLine.transition().duration(500).style("opacity", 0)

                  visible = false;
                  return visible;
              }
              else {
                  filteredLine.transition().duration(500).style("opacity", 1)
                  visible = true;
                  return visible;
              }
          })
          .text("Airbus");

      var visible = true;
      svg.append("text")
          .attr("x", width+55)
          .attr("y", height + margin.top -440)
          .attr("font-weight", "bold")
          .attr("class", "legend")
          .style("fill", "#ff7f0e")
          .on("click", function(){
              var filteredLine = make.filter(function(d,i){return i ===1;})
              if (visible == true){
                  filteredLine.transition().duration(500).style("opacity", 0)
                  visible = false;
                  return visible;
              }
              else {
                  filteredLine.transition().duration(500).style("opacity", 1)
                  visible = true;
                  return visible;
              }
          })
          .text("Boeing");
      svg.append("text")
          .attr("x", width+55)
          .attr("y", height + margin.top -100)
          .attr("font-weight", "bold")
          .attr("class", "legend")
          .style("fill", "#2ca02c")
          .on("click", function(){
              var filteredLine = make.filter(function(d,i){return i ===4;})
              if (visible == true){
                  filteredLine.transition().duration(500).style("opacity", 0)
                  visible = false;
                  return visible;
              }
              else {
                  filteredLine.transition().duration(500).style("opacity", 1)
                  visible = true;
                  return visible;
              }
          })
          .text("Bombardier");
      svg.append("text")
          .attr("x", width+55)
          .attr("y", height + margin.top -85)
          .attr("font-weight", "bold")
          .attr("class", "legend")
          .style("fill", "#9467bd")
          .on("click", function(){
              var filteredLine = make.filter(function(d,i){return i ===3;})
              if (visible == true){
                  filteredLine.transition().duration(500).style("opacity", 0)
                  visible = false;
                  return visible;
              }
              else {
                  filteredLine.transition().duration(500).style("opacity", 1)
                  visible = true;
                  return visible;
              }
          })
          .text("Embraer");
      svg.append("text")
          .attr("x", width+55)
          .attr("y", height + margin.top )
          .attr("font-weight", "bold")
          .attr("class", "legend")
          .style("fill", "#8c564b")
          .on("click", function(){
              var filteredLine = make.filter(function(d,i){return i ===0;})
              if (visible == true){
                  filteredLine.transition().duration(500).style("opacity", 0)
                  visible = false;
                  return visible;
              }
              else {
                  filteredLine.transition().duration(500).style("opacity", 1)
                  visible = true;
                  return visible;
              }
          })
          .text("McDonnell Douglas")
      svg.append("line")
          .attr("x1",1000)
          .attr("y1",260)
          .attr("x2",880)
          .attr("y2",260)
          .attr("stroke","black")
          .attr("stroke-width",2)
          .attr("marker-end","url(#arrow)");
      svg.append("text")
         .attr("x", width+135)
         .attr("y", height + margin.top -293)
         .text("click me!")*/


      // Append legends
    var legendLabel = g.append("g")
      .append("text")
      .attr("x", width + 80)
      .attr("y", -15)
      .attr("fill", "#000")
      .attr("font-family", "Helvetica")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text("Years of Held Ted Talks")
      /*.append("tspan")
      .attr('x', width -95)
      .attr('y', -7)
      .attr("font-weight", "normal")
      .text("(click 'Boeing' or 'Airbus' corresponding rectangles for more in-depth views then scroll down!)")*/


    var legend = g.append("g")
      .attr("font-family", "Helvetica")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 24 + ")"; });

    var counter = 0;
    legend.append("rect")
      .attr("x", width + 120)
      .attr("width", 23)
      .attr("height", 23)
      .attr("fill", function(d) {
          //console.log(z(d))
          return z(d);
      })


    legend.append("text")
      .attr("x", width + 110)
      .attr("y", 9.5)
      .attr("dy", "0.30em")
      .text(function(d) { return d; })
      .attr("font-weight", function(d){
          return "bold"
      })
  });

  function type(d, _, columns) {
    d.year = +d.year;
    //d.date = parseTime(d.Activity_Period);
    //d.count = count(d);
    return d;
  }
})();
