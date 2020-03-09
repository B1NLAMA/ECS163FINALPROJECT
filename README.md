# ECS163FINALPROJECT

Here we will write about what kind of visualizations we are implementing.

In the list below, we will write an update for what is the progress for the visualizations.

### Line Chart

### Calendar Chart

### Bubble Chart
I have not started on it yet. Still thinking about the data.

### Parallel Coordinates
I have plotted the parallel coordinates chart.
I have improved the filter now and also changed the way our selection interacts with the line.
I figured out how to filter by the tags, year and month.

```
data = data.filter(function(d) {
  var included = false;
  for(var i= 0; i < d.tags.length; i++) {
    if ((selectedtag.indexOf(d.tags[i])) != -1) {
      included = true;
    }
  }
  return ((d.year === filteryear) && (d.month === filtermonth)) && included
})
```

### Embedded video
I have not started on this yet.
