var slider = document.getElementById("yearSlider");
var year = "1961";
var selectedYear = 1961;
var flag_for_execution = 0;
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width_svg = screen.width,
  height_svg = screen.height;
var country;
var slidecontainer = document.getElementById("tooltipSlider");
const currentYearDisplay = document.getElementById("current-year");
var MapScale = 130;
let topo;
var isClickedOnce = false;
// function loadData(year);

function debounce(func, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

var clickfunc = function (event, d) {
  isClickedOnce = true;
  d3.select("#scatter svg").remove();
  d3.select("#chart svg").remove();

  // Select the div where the chart will be rendered
  let svg_2 = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width_svg / 1.8)
    .attr("height", height_svg / 1.8)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the country for which data will be visualized
  country = d.properties.name;

  // Add country name to the top right corner of the svg_2
  svg_2
    .append("text")
    .attr("x", width_svg / 2 - 10)
    .attr("y", 20)
    .attr("text-anchor", "end")
    .attr("font-size", "34px")
    .attr("fill", "black")
    .text(country);

  // Add text to show selected year
  let selectedYearText = svg_2
    .append("text")
    .attr("x", width_svg / 2)
    .attr("y", height_svg + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "black");

  var x, y, xAxis, yAxis, line;

  // Load data from CSV and visualize
  d3.csv("final_nutrition.csv").then(function (data) {
    // Parse Year as Date object and Score as number
    data = data.filter((d) => d.Country === country);
    data.forEach(function (d) {
      d.Year = new Date(+d.Year, 0); // Convert year to Date object
      d.Score = +d.Score;
    });

    // Create x scale for time
    x = d3
      .scaleTime()
      .domain([new Date(1961, 0), new Date(2020, 0)]) // Initial domain from 1961 to 2020
      .range([0, width_svg / 2]);

    // Create y scale for linear values
    y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.Score) - 1, d3.max(data, (d) => d.Score) + 1]) // Adjusted scale domain
      .range([height_svg / 2, 0]);

    // Add x-axis
    xAxis = svg_2
      .append("g")
      .attr("transform", "translate(0," + height_svg / 2 + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format ticks to show only years

    // Add y-axis
    svg_2.append("g").call(d3.axisLeft(y));

    // Add line
    line = svg_2
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.Year))
          .y((d) => y(d.Score))
      );

    // Add data points
    svg_2
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Year))
      .attr("cy", (d) => y(d.Score))
      .attr("r", 5)
      .attr("fill", "#69b3a2");

    d3.selectAll("#yearSlider").on("input", function () {
      flag_for_execution = 1;
      selectedYear = +this.value;
      let filteredData = data.filter((d) => d.Year <= new Date(selectedYear, 0)); // Filter data based on selected year
      x.domain([new Date(1961, 0), new Date(selectedYear, 0)]); // Update x domain
      xAxis.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format ticks to show only years

      // Update line
      line
        .datum(filteredData) // Update data for the line
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d.Year))
            .y((d) => y(d.Score))
        );

      // Update data points
      svg_2
        .selectAll("circle")
        .data(filteredData, (d) => d.Year) // Update data for the circles
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("cx", (d) => x(d.Year))
              .attr("cy", (d) => y(d.Score))
              .attr("r", 5)
              .attr("fill", "#69b3a2"),
          (update) => update.attr("cx", (d) => x(d.Year)),
          (exit) => exit.remove() // Remove excess circles
        );

      // Update selected year text
      selectedYearText.text(selectedYear);
    });
  });

  const OriginalData = [
    {
      label: "Daily caloric intake per person that comes from animal protein",
      percentage: 6,
    },
    {
      label: "Daily caloric intake per person that comes from vegetal protein",
      percentage: 6,
    },
    { label: "Daily caloric intake per person from fat", percentage: 23 },
    {
      label: "Daily caloric intake per person from carbohydrates",
      percentage: 52.5,
    },
    {
      label: "Daily caloric intake per person from Sugar & Sweeteners",
      percentage: 7.5,
    },
    {
      label: "Daily caloric intake per person that comes from Fruit",
      percentage: 2.5,
    },
    {
      label: "Daily caloric intake per person that comes from Vegetables",
      percentage: 2.5,
    },
  ];

  // Set up SVG container
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width_svg / 3)
    .attr("height", height_svg / 2);

  // Initialize tooltip
  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  // Load data from CSV
  function loadData(year) {
    let title = svg.selectAll("text").remove();
    d3.select("#chart").selectAll("g").remove();
    // svg.selectAll("#chart").remove();
    title = svg
      .append("text")
      .attr("x", width_svg / 6.5)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text(`${country} (${year})`)
      .style("font-size", "18px")
      .style("font-weight", "bold");
    var p2 = year;
    d3.csv("final.csv").then(function (data) {
      // Filter data based on Country and Year
      let filteredData = data.filter((d) => d.Country == country && d.Year == p2);
      // Extract labels and values from filtered data
      if (filteredData.length == 0) {
        svg.selectAll("g").remove();
        svg
          .append("image")
          .attr("xlink:href", "./no-data-found.avif")
          .attr("width", window.innerWidth / 4)
          .attr("height", window.innerHeight / 2)
          .attr("x", window.innerWidth / 24)
          .style("margin", "auto");
        return;
      }
      let pieData = Object.keys(filteredData[0])
        .slice(3)
        .map((label, index) => ({
          label: label,
          value: +filteredData[0][label],
          percentage: OriginalData[index].percentage,
        }));

      // Compute maximum value for scaling
      let maxValue = d3.max(pieData, (d) => d.value);

      // Scale for radius
      let radiusScale = d3.scaleLinear().range([50, 200]).domain([0, maxValue]);

      // Color scale
      let colorScale = d3.scaleOrdinal().range(["pink", "orange", "red", "brown", "yellow", "skyblue", "green"]);

      // Pie chart layout
      let pie = d3
        .pie()
        .value((d) => d.percentage)
        .sort(null);

      // Arc generator
      let arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(function (d) {
          return radiusScale(d.data.value);
        });

      // Group element for the pie chart
      let g = svg.append("g").attr("transform", `translate(${width_svg / 5.67}, ${height_svg / 4})`);

      // Path elements for the arcs
      let paths = g
        .selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => colorScale(d.data.label))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(`${d.data.label}: ${d.data.value} kcal`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
          // Show the label corresponding to the hovered sector
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.transition().duration(200).style("opacity", 0);
        })
        .transition() // Add transition for smoother animation
        .duration(750)
        .attrTween("d", function (d) {
          let interpolate = d3.interpolate(this._current, arc(d));
          this._current = interpolate;
          return interpolate;
        });

      paths.transition().duration(100).attr("d", arc);
    });
    // svg
    //   .attr("width", width_svg / 3)
    //   .attr("height", height_svg / 2)
    //   .attr("viewBox", `0 0 ${width_svg / 3} ${height_svg / 2}`)
    //   .attr("preserveAspectRatio", "xMidYMid meet");
    // svg_2
    //   .attr("width", width_svg / 1.8)
    //   .attr("height", height_svg / 1.8)
    //   .attr("viewBox", `0 0 ${width_svg / 1.8} ${height_svg / 1.8}`)
    //   .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // Initial load
  loadData("2020");

  // Slider event handler
  const slider = document.getElementById("yearSlider");
  slider.addEventListener(
    "input",
    debounce(function () {
      loadData(this.value);
    }, 500)
  );
};

var tooltip_map = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

var mouseOver = function (event, d) {
  d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);
  d3.select(this).transition().duration(200).style("opacity", 1).style("stroke", "black").style("cursor", "pointer");

  // Update tooltip content
  let countryName = d.properties.name;
  let countryValue = d.total.toFixed(2);
  tooltip_map.html(`
  <div class="country-and-year"><span class="country"><b>${countryName}</b><br></span><span class="year">${year}</span></div>
  <div class="score"><span class="score-heading">Balanced Diet Index (BDI)</span> <br> <span class="score-value" style="color: ${colorScale(countryValue)};"><b>${countryValue}</b></span></div>
  </div>`);

  // Show tooltip
  tooltip_map.transition().duration(100).style("opacity", 0.9);

  // Set tooltip position
  tooltip_map.style("left", event.pageX + "px").style("top", event.pageY + "px");
};

var mouseLeave = function (event, d) {
  d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
  d3.select(this).transition().duration(200).style("stroke", "transparent").style("cursor", "default");

  // Hide tooltip
  tooltip_map.transition().duration(200).style("opacity", 0);
};

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
  year = this.value;
  console.log(this.value);
  currentYearDisplay.textContent = this.value;
  currentYearDisplay.style.color = "black";
  currentYearDisplay.style.fontWeight = "bold";

  data.clear();

  Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("final_nutrition.csv", function (d) {
      if (d.Year == year) {
        data.set(d.Code, +d.Score);
        data.set(d.Country, +d.Score);
      }
    }),
  ]).then(function (loadData) {
    let topo = loadData[0];
    // Draw the map
    svg_map
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("opacity", 0.8)
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      .on("click", clickfunc);
  });
};

// The svg
let svg_map = d3.select("svg");
(width = screen.width / 2), (height = screen.height / 2);

// Map and projection
let path = d3.geoPath();
let projection = d3
  .geoMercator()
  .scale(MapScale)
  .center([0, 20])
  .translate([width / 2, height / 2]);

// Data and color scale
let data = new Map();
// console.log(d3.schemeBlues);
let colorScale = d3.scaleThreshold().domain([0, 1, 3.5, 4, 5, 6.5, 7, 7.5, 8]).range(d3.schemeBlues[9]);

// Create SVG for legends
const legendSvg = d3.select("svg").append("g").attr("class", "legend").attr("transform", "translate(20,20)"); // Adjust the position of the legend as needed

// Define color scale domain for legend
const legendDomain = [0, 1, 3.5, 4, 5, 6.5, 7, 7.5, 8];
const legendColors = d3.schemeBlues[9];

// Create legend color scale
const legendColorScale = d3.scaleLinear().domain(legendDomain).range(legendColors);

// Calculate legend block width
const legendBlockWidth = 20; // Adjust the width of legend blocks as needed

// Append rectangles for legend
legendSvg
  .selectAll("rect")
  .data(legendColors)
  .enter()
  .append("rect")
  .attr("x", (d, i) => i * legendBlockWidth)
  .attr("y", 0)
  .attr("width", legendBlockWidth)
  .attr("height", 10) // Adjust the height of legend blocks as needed
  .style("fill", (d, i) => legendColors[i]);

// Append text labels for legend
legendSvg
  .selectAll("text")
  .data(legendDomain)
  .enter()
  .append("text")
  .attr("x", (d, i) => i * legendBlockWidth)
  .attr("y", 25) // Adjust the y position of legend labels as needed
  .text((d) => d)
  .style("font-size", "10px");

// Append legend title
legendSvg.append("text").attr("x", 0).attr("y", -5).text("Balanced Diet Index (BDI)").style("font-size", "12px").style("font-weight", "bold");

// Load external data and boot
Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("final_nutrition.csv", function (d) {
    if (d.Year == year) {
      data.set(d.Code, +d.Score);
      data.set(d.Country, +d.Score);
    }
  }),
]).then(function (loadData) {
  topo = loadData[0];

  // Draw the map
  svg_map
    .append("g")
    .selectAll("path")
    .data(topo.features)
    .join("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("mousemove", function (event) {
      tooltip_map.style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
    })
    .on("click", clickfunc);
  svg_map.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
});
