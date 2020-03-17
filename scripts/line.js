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
      .each(function() {
         transCount++;
       })
      .transition()
          .duration(5000)
          .ease(d3.easeSin)
          .attr("stroke-dashoffset", 0)
          .on("end", function() {
              transCount--;
              if (!transCount) {
                drawInteractivity(filteredMakes);
              }}
          );

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

  function drawInteractivity(makes) {
    // Append interactivity
    var mouseG = svg.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // Vertical line to follow mouse
      .attr("class", "mouse-line")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .style("stroke", "darkgray")
      .style("stroke-width", "1.25px")
      .style("opacity", "0");

    mouseG.append("text") // Date on vertical line
      .attr("class", "mouse-line-text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(makes)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 5)
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .style("stroke", function(d) { return z(d.key); })
      .style("fill", "none")
      .style("stroke-width", "1.25px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("transform", "translate(60,20)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.select(".mouse-line-text")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.select(".mouse-line-text")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line-text")
          .attr("transform", "translate(" + (mouse[0] + margin.left) + ", " + 50 + ")");

        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                idx = bisect(d.values, xDate);

            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            d3.select(this).select("text")
              .text(Math.round(y.invert(pos.y)).toLocaleString());

            var formatTime = d3.timeFormat("%B, %Y");

            d3.select(".mouse-line-text")
              .text(formatTime(xDate));

            return "translate(" + mouse[0] + "," + pos.y +")";
          });
        });
  }
})();
