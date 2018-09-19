/*
  SETUP: Before creating rendering the data, 
  create the basic layout for the chart.
*/

// Set the margins, width and height, then render the chart
var barHeight = 20,
  fontHeight = barHeight * .75,
  padding = 10;
var margin = {top: 20, right: 20, bottom: 0, left: 175},
  width = 875 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;
var chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
var body = chart.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")" )
  .attr("class", "chart-body");


// Create horizontal scale function, then draw the top axis
// with a list of the months
var x = d3.scaleTime()
  .domain([new Date(2012, 0, 1), new Date(2012, 11, 31)])
  .range([0, width]);
var xAxis = d3.axisTop(x)
  .ticks(d3.timeMonth.every(1))
  .tickFormat(d3.timeFormat("%B"))
  .tickSize(0);
chart.append("g")
  .attr("width", width + margin.left + margin.right)
  .attr("height", barHeight)
    .attr("transform", "translate(" + margin.left + ", " + barHeight + ")")
  .attr("class", "months")
  .call(xAxis)
    .selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)

// Helper function for rounding dates to nearest half-month
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

// Makes gridlines, called after the bars are rendered
function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(12)
}

/*
  UPDATE FUNCTION
  All data is rendered to svg with this function, which can be
  called by the d3.csv()'s callback function etc
*/
function update(data) {
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

  body.attr("height", barHeight * data.length);

  /*
    Create an svg group to contain season bars and 
    background color for each crop in the array of items
  */
  var bar = body.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });


  // Add an alternating background shade with even & odd indices.
  bar.append("rect")
    .attr("height", barHeight)
    .attr("width", function(d) {
      return x(12)
    })
    .attr("fill", function(d, i) {
      let x = i % 2;
      if (x == 0) {
        return "#ffffe0"
      } else {
        return "#fffac9"
      }
    });

  /*
    DATA BARS
    Render the first season range, then if there's a second
    season range, render it. Finally, render the label for
    each season.
  */
  bar.append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x(d.startFirst);
    })
    .attr("width", function(d) {
      return x(d.endFirst - d.startFirst);
    })
    .attr("height", barHeight - 1)
    .attr("fill", "#90ddbb");
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
    .attr("height", barHeight - 1)
    .attr("fill", "#90ddbb");
  bar.append("text")
    .attr("x", - padding)
    .attr("dy", (barHeight / 2) + (fontHeight / 2))
    .style("font-size", fontHeight)
    .attr("fill", "black")
    .attr("text-anchor", "end")
    .attr("font-family", "sans-serif")
    .text(function(d) {
      return d.name;
    });

  // Create a grid
  body.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + barHeight * data.length + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )
}

// Import the data from CSV and call update()
d3.csv("seasons.csv", update);

d3.select("#download").on("click", function() {
  d3.select(this)
    .attr("href", 'data:application/octet-stream;base64,' + btoa(d3.select(".svg-container").html()))
    .attr("download", "chart.svg") 

})

const inputs = document.querySelectorAll('input');
function changeHandler(event) {
  let data = [];
  inputs.forEach(input => {
    const i = input.name.split("-")[0];
    const position = input.name.split("-")[1];
    const season = input.name.split("-")[2];
    if (data[i] === undefined) { data[i] = {}; } 
    switch (input.name.split("-")[1]) {
      case "name":
        data[i].name = input.value;
        break;
      case "start":
        if (input.name.split("-")[2] === "one") {
          data[i].seasonOneStartingMonth = input.value.split("-")[1]
          data[i].seasonOneStartingDay = input.value.split("-")[2]
        }
        data[i].seasonTwoStartingMonth = input.value.split("-")[1]
        data[i].seasonTwoStartingDay = input.value.split("-")[2]
        break;
      case "end": 
        if (input.name.split("-")[2] === "one") {
          data[i].seasonOneEndingMonth = input.value.split("-")[1]
          data[i].seasonOneEndingDay = input.value.split("-")[2]
        }
        data[i].seasonTwoEndingMonth = input.value.split("-")[1]
        data[i].seasonTwoEndingDay = input.value.split("-")[2]
        break;
      default:
        
    }
    console.log(`${input.name.toUpperCase()}\n`
    + `index: ${i}, position: ${position}, season: ${season}`);
  })
  console.log(data);
}

console.log(inputs)
inputs.forEach(input => {
  input.onchange = changeHandler;
});