var barHeight = 20,
  fontHeight = barHeight * .75,
  padding = 10;

var margin = {top: 20, right: 20, bottom: 0, left: 175},
  width = 875 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

var x = d3.scaleTime()
  .domain([new Date(2012, 0, 1), new Date(2012, 11, 31)])
  .range([0, width]);

var chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")" )
  .attr("class", "chart-body");

var xAxis = d3.axisTop(x)
  .ticks(d3.timeMonth.every(1))
  .tickFormat(d3.timeFormat("%B"))
  .tickSize(0);

d3.select(".chart").append("g")
.attr("width", width + margin.left + margin.right)
.attr("height", barHeight)
  .attr("transform", "translate(" + margin.left + ", " + barHeight + ")")
  .attr("class", "months")
.call(xAxis)
  .selectAll(".tick text")
    .style("text-anchor", "start")
    .attr("x", 6)

/**
**/

function calcDate(month, day) {
  let date = 0;
  if (day >= 20) {
    date = month;
  } else if (day > 10) {
    date = month - 0.5;
  } else if (day <= 10) {
    date = month - 1;
  } else {
    console.log("Error calculating date.");
  }
  return date;
};

function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(12)
}

d3.csv("seasons.csv", function(data) {
  data.forEach(function(d) {
    d.startFirst = calcDate(d.seasonOneStartingMonth, d.seasonOneStartingDay);
    d.endFirst = calcDate(d.seasonOneEndingMonth, d.seasonOneEndingDay);
    d.startSecond = calcDate(d.seasonTwoStartingMonth, d.seasonTwoStartingDay);
    d.endSecond = calcDate(d.seasonTwoEndingMonth, d.seasonTwoEndingDay);
  })
  data.sort(function(a,b) {
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  x.domain([0, d3.max(data, function(d) { return d.endFirst; })]);

  chart.attr("height", barHeight * data.length);

  /**
    * Create an svg group to contain season bars and background color for each crop in the array of items
  **/
  var bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });


/**
  * Add an alternating background shade with even & odd indices.
**/
  bar.append("rect")
    .attr("height", barHeight)
    .attr("width", function(d) {
      return x(12)
    })
    .attr("class", function(d, i) {   // perhaps rewrite this to add a class, rather than fill
      let x = i % 2;
      if (x == 0) {
        return "bar-bg even-bg"
      } else {
        return "bar-bg odd-bg"
      }
    });


  bar.append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x(d.startFirst);
    })
    .attr("width", function(d) {
      return x(d.endFirst - d.startFirst);
    })
    .attr("height", barHeight - 1);
  bar.append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      if (d.startFirst) {
        return x(d.startSecond);
      } else {return 0;};
    })
    .attr("width", function(d) {
      if (d.startFirst) {
        return x(d.endSecond - d.startSecond);
      } else {return 0;}
    })
    .attr("height", barHeight - 1);
  bar.append("text")
    .attr("x", - padding)
    .attr("dy", (barHeight / 2) + (fontHeight / 2))
    .style("font-size", fontHeight)
    .text(function(d) {
      return d.name;
    });

    chart.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + barHeight * data.length + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

});
