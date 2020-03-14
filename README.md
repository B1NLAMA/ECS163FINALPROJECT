# ECS163FINALPROJECT

Here we will write about what kind of visualizations we are implementing.

In the list below, we will write an update for what is the progress for the visualizations.

### Line Chart

### Calendar Chart

### Bubble Chart
Done:
  1. I have made the bubble chart
  2. Made it interactive but has bugs and cannot do multiple selection
  3. Allow multiple selections.
  4. I have to allow it to filter the parallel coordinates
TODO:
  1. Improve the multiple selection error

### Parallel Coordinates
 1. I have plotted the parallel coordinates chart.
 2. I have improved the filter now and also changed the way our selection interacts with the line.
 3. I figured out how to filter by the tags, year and month.
 4. I have added legend and also added color by tags.
 5. Added an interaction where if brushed, it will filter the tag

TODO:
 1. When I filter using bubble and then filter using parallel coordinate and then go back to the original tags list, the selected tags opacity will return to normal. (don't know how to fix this yet)
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
