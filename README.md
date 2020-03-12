# ECS163FINALPROJECT

Here we will write about what kind of visualizations we are implementing.

In the list below, we will write an update for what is the progress for the visualizations.

### Line Chart

### Calendar Chart

### Bubble Chart
Done:
  I have made the bubble chart

TODO:
  1. I have to make it interactive
  2. I have to allow it to filter the parallel coordinates
  3. Other things I cannot think of right now.

### Parallel Coordinates
I have plotted the parallel coordinates chart.
I have improved the filter now and also changed the way our selection interacts with the line.
I figured out how to filter by the tags, year and month.
I have added legend and also added color by tags.

```
This is an code that calls the filter.

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
DONE:

TODO:
  1. The TA told me to just make a pop up for the embedded video so, I might go with that. So, when people click on the video, I will create a pop up thing that will let them click on the link to go watch the video.

  2. I have not started on this yet.
