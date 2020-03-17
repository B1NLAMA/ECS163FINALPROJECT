function calendarView(yearChosen){
    //general layout information
    var cellSize = 10;
    var xOffset=20;
    var yOffset=60;
    var calY=50;
    var calX=25;
    var width4 = 400;
    var height4 = 163;
    var parseDate = d3.timeParse("%Y-%m-%d");
    format = d3.timeFormat("%d-%m-%Y");
    toolDate = d3.timeFormat("%d/%b/%y");

    d3.csv("./data/ted_main.csv", function(error, data) {

        var dates = new Array();
        var values = new Array();
        var dateData = data;

        var years = d3.nest()
        .key(function(d) { return d.year; })
        .key(function(d) { return d.date; })
        .rollup(function(v) {
          return v.length; })
        .entries(data);

        //parse the data
        data.forEach(function(d)    {
                dates.push(parseDate(d.date));
                values.push(d.value);
                d.date=parseDate(d.date);
                d.value=d.value;
                d.year=d.date.getFullYear();
        });

        var yearlyData = d3.nest()
            .key(function(d){
              return d.year;})
            .entries(data);


        var filtered = yearlyData.filter(function(d){
          return +d.key === yearChosen;
        });

        var count = new Array();
        count = years.filter(function(d){
          return +d.key === yearChosen;
        })

        var finalCount = new Array();
        finalCount = count[0].values;

        var num = count[0].values;
        var max = 1, min = 5;
        for(var i = 0; i < num.length; i++){
          if(+num[i].value > +max){
            max = num[i].value;
          }
          if(+num[i].value < +min){
            min = num[i].value;
        }}

        var svg = d3.select("#calendar")
            .attr("width", width4)

        //create a group for each year
        var cals = svg.selectAll("g")
            .data(filtered)
            .enter()
            .append("g")
            .attr("id",function(d){
                return d.key;
            })
            .attr("transform",function(d,i){
                return "translate(-40,"+(yOffset+(i*(height4+calY)))+")";
            })

        var labels = cals.append("text")
            .attr("class","yearLabel")
            .attr("x",xOffset + 20)
            .attr("y",25)
            .text(function(d){return d.key});

        //create rectangle for each year
        var rects = cals.append("g")
            .attr("id","alldays")
            .selectAll(".day")
            .data(function(d) {
                return d3.timeDays(new Date(parseInt(d.key), 0, 1), new Date(parseInt(d.key) + 1, 0, 1)); })
            .enter().append("rect")
            .attr("id",function(d) {
                return "_"+format(d);
            })
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) {
                return xOffset+calX+(d3.timeWeek.count(d3.timeYear(d), d)* cellSize);
            })
            .attr("y", function(d) {
              return calY+(d.getDay() * cellSize); })
            .datum(format)

        var clicked = new Array();
        //create day labels
        var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dayLabels=cals.append("g").attr("id","dayLabels")
        days.forEach(function(d,i)    {
            dayLabels.append("text")
            .attr("class","dayLabel")
            .attr("x",xOffset)
            .attr("y",function(d) { return calY+(i * cellSize); })
            .attr("dy","0.9em")
            .text(d);
        })

        interpolator = d3.interpolate("#fdbb84", "#d7301f");
        var sequentialScale = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(interpolator);

         var tooltipCal = d3.select(".caltooltip");

        //draw data on squares for day
        var choose = new Array();
        var dataRects = cals.append("g")
            .attr("id","dataDays")
            .selectAll(".dataday")
            .data(finalCount, function(d, i){
              choose.push(finalCount[i].value);
              return finalCount[i].value; }
            )
            .enter()
            .append("rect")
            .attr("stroke","#ccc")
            .attr("id", function(d){
              return d.key;})
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d, i){
                return xOffset+calX+(d3.timeWeek.count(d3.timeYear(new Date(d.key)), new Date(d.key)) * cellSize);
              })
            .attr("y", function(d, j) {
                return calY+(new Date(d.key).getDay() * cellSize); })
            .attr("fill", function(d, k){
              var yes = d.value;
              return sequentialScale(yes);
            })
            .on('click', function(datum, index, nodes) {
              var id = d3.select(this).attr('id');
              //clicked.push(id);
              console.log(id);
              filterForParallel(id);
            })
            .on("mouseover", function(d) {
              tooltipCal.style("display", "block");

              //set the initial position of the tooltip
              tooltipCal.style("left", (d3.event.pageX) +"px");
              tooltipCal.style("top", (d3.event.pageY + 10) + "px");
              tooltipCal.html("<strong>Date: </strong>" + d.key + "<br>"
                + "<strong>Ted Talks Given: </strong>" + d.value);
            })
            .on("mousemove", function(d) {
              tooltipCal.style("left", (d3.event.pageX) +"px");
              tooltipCal.style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseleave", function(d) {
              tooltipCal.style("display", "none");
            })

        //add montly outlines for calendar
        var monthName;
        cals.append("g")
        .attr("id","monthOutlines")
        .selectAll(".month")
        .data(function(d) {

            return d3.timeMonths(new Date(parseInt(d.key), 0, 1),
                                  new Date(parseInt(d.key) + 1, 0, 1));
        })
        .enter().append("path")
        .attr("class", "month")
        .attr("transform","translate("+(xOffset+calX)+","+calY+")")
        .attr("d", monthPath)

        //retreive the bounding boxes of the outlines
        var BB = new Array();
        var mp = document.getElementById("monthOutlines").childNodes;
        for (var i=0;i<mp.length;i++){
            BB.push(mp[i].getBBox());
        }

        var monthX = new Array();
        BB.forEach(function(d,i){
            boxCentre = d.width/2;
            monthX.push(xOffset+calX+d.x+boxCentre);
        })

        //create centred month labels around the bounding box of each month path
        //create day labels
        var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var monthLabels=cals.append("g").attr("id","monthLabels")
        months.forEach(function(d,i)    {
            monthLabels.append("text")
            .attr("class","monthLabel")
            .attr("x",monthX[i])
            .attr("y",calY/1.2)
            .text(d);
        })


    var axisScale = d3.scaleLinear()
    .domain(sequentialScale.domain())
    .range([0, width4 / 2])

    var axisBottom = g => g
      .attr("class", 'x-axis')
      .attr("transform", "translate(70, "+ (height4) +")")
      .call(d3.axisBottom(axisScale)
        .ticks(width4 / 80)
        .tickSize(5))
  const defs = cals.append("defs");

  const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
    .data(sequentialScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: sequentialScale(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  cals.append('g')
    .append("rect")
    .attr("transform", "translate(70, "+ (height4 - (height4 / 20)) +")")
    .attr("width", width4 / 2)
    .attr("height", height4 / 20)
    .style("fill", "url(#linear-gradient)");

  cals.append('g')
    .call(axisBottom);

  return svg.node();

    });//end data load

    //compute and return monthly path data for any year
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
          d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
    }
} //end of function

calendarView(2014);
