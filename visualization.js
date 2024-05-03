// 1. Load the Data
d3.csv("https://raw.githubusercontent.com/tadhgfitzgerald/fifa_ranking/4346e61117b788dbe9604523821142bc23a234a4/fifa_ranking.csv")
  .then(function(data) {
    // Parse the Data
    data.forEach(function(d) {
      d.rank_date = new Date(d.rank_date);
      d.rank = +d.rank;
    });

    // Create a container for the charts
    var chartContainer = d3.select("body")
                           .append("div")
                           .attr("class", "chart-container");

    // 1. Line Chart
    var lineChartSVG = chartContainer.append("svg")
                                     .attr("class", "chart")
                                     .attr("width", 400)
                                     .attr("height", 300);

    // Add Title for Line Chart
    lineChartSVG.append("text")
                 .attr("x", 200)
                 .attr("y", 30)
                 .attr("text-anchor", "middle")
                 .text("FIFA Soccer Rankings Over Time by Continent")
                 .style("font-size", "20px");

    // Set up Scales for Line Chart
var xScale = d3.scaleTime()
                .domain(d3.extent(data, function(d) { return d.rank_date; }))
                .range([50, 350]);

var yScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return d.rank; })])
                .range([50, 250]);


    // Draw the Axes for Line Chart
var xAxis = d3.axisBottom(xScale).ticks(5);
var yAxis = d3.axisLeft(yScale).ticks(7);

    lineChartSVG.append("g")
            .attr("transform", "translate(0,250)")
            .call(xAxis)
            .append("text")
            .attr("x", 200)
            .attr("y", 40)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("Date");

lineChartSVG.append("g")
            .attr("transform", "translate(50,0)")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -150)
            .attr("y", -30)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("Ranking");

    // Draw the Line Chart by Continent
var lineByContinent = d3.line()
                        .x(function(d) { return xScale(d.rank_date); })
                        .y(function(d) { return yScale(d.rank); });

var continents = Array.from(d3.group(data, d => d.confederation), ([key, value]) => ({
    confederation: key,
    values: value
}));

var color = d3.scaleOrdinal(d3.schemeCategory10);

continents.forEach(function(continent) {
    lineChartSVG.append("path")
                .datum(continent.values)
                .attr("fill", "none")
                .attr("stroke", color(continent.confederation))
                .attr("stroke-width", 1.5)
                .attr("d", lineByContinent);
});

    // 2. Scatter Plot
 var scatterPlotSVG = chartContainer.append("svg")
    .attr("class", "chart")
    .attr("width", 400)
    .attr("height", 300);

// Add Title for Scatter Plot
scatterPlotSVG.append("text")
    .attr("x", 200)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("Ranking Change Over Time by Continent")
    .style("font-size", "20px");

// Prepare Data for Scatter Plot
var rankingChangeData = data.map(function(d) {
    return {
        country: d.country_full,
        rank_date: new Date(d.rank_date),
        rank_change: +d.rank_change,
        continent: d.confederation // 대륙 정보 추가
    };
});

// Set up Scales for Scatter Plot
var xScaleScatter = d3.scaleTime()
    .domain(d3.extent(rankingChangeData, function(d) { return d.rank_date; }))
    .range([50, 350]);

var yScaleScatter = d3.scaleLinear()
    .domain(d3.extent(rankingChangeData, function(d) { return d.rank_change; }))
    .range([250, 50]);

// Draw Circles for Scatter Plot by Continent
scatterPlotSVG.selectAll("circle")
    .data(rankingChangeData)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScaleScatter(d.rank_date); })
    .attr("cy", function(d) { return yScaleScatter(d.rank_change); })
    .attr("r", 4)
    .attr("fill", function(d) { return color(d.continent); }); // 대륙별로 다른 색상 사용

// Draw Axes for Scatter Plot
var xAxisScatter = d3.axisBottom(xScaleScatter).ticks(5);
var yAxisScatter = d3.axisLeft(yScaleScatter).ticks(5);

scatterPlotSVG.append("g")
    .attr("transform", "translate(0,250)")
    .call(xAxisScatter)
    .append("text")
    .attr("x", 200)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Date");

scatterPlotSVG.append("g")
    .attr("transform", "translate(50,0)")
    .call(yAxisScatter)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -150)
    .attr("y", -30)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Ranking Change");


// 3. Bar Chart
var barChartSVG = chartContainer.append("svg")
                                 .attr("class", "chart")
                                 .attr("width", 400)
                                 .attr("height", 300);

// Add Title for Bar Chart
barChartSVG.append("text")
           .attr("x", 200)
           .attr("y", 30)
           .attr("text-anchor", "middle")
           .text("Average FIFA Rankings by Continent")
           .style("font-size", "20px");

// Prepare Data for Bar Chart
var continentRankings = Array.from(d3.group(data, d => d.confederation), ([key, value]) => ({
  confederation: key,
  averageRank: d3.mean(value, d => +d.rank)
}));

// Set up Scales for Bar Chart
var xScaleBar = d3.scaleLinear()
                  .domain([0, d3.max(continentRankings, d => d.averageRank)])
                  .range([50, 350]);

var yScaleBar = d3.scaleBand()
                  .domain(continentRankings.map(d => d.confederation))
                  .range([50, 250])
                  .padding(0.1);

// Draw Bars for Bar Chart
barChartSVG.selectAll("rect")
    .data(continentRankings)
    .enter()
    .append("rect")
    .attr("x", 50)
    .attr("y", d => yScaleBar(d.confederation))
    .attr("width", d => xScaleBar(d.averageRank) - 50)
    .attr("height", yScaleBar.bandwidth())
    .attr("fill", function(d, i) { return d3.schemeCategory10[i]; });

// Draw Axes for Bar Chart
var xAxisBar = d3.axisBottom(xScaleBar).ticks(7);
var yAxisBar = d3.axisLeft(yScaleBar).tickSizeOuter(0);

barChartSVG.append("g")
           .attr("transform", "translate(0,250)")
           .call(xAxisBar)
           .append("text") 
           .attr("x", 200)
           .attr("y", 40)
           .attr("fill", "black")
           .attr("text-anchor", "middle")
           .text("Average Rank");

barChartSVG.append("g")
           .attr("transform", "translate(50,0)")
           .call(yAxisBar)
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("x", -150)
           .attr("y", -30)
           .attr("fill", "black")
           .attr("text-anchor", "middle")

           .text("Continent");

    // 4. Pie Chart
    var pieChartSVG = chartContainer.append("svg")
                                    .attr("class", "chart")
                                    .attr("width", 400)
                                    .attr("height", 300);

    // Add Title for Pie Chart
    pieChartSVG.append("text")
               .attr("x", 200)
               .attr("y", 30)
               .attr("text-anchor", "middle")
               .text("Confederation Comparison")
               .style("font-size", "20px");

    // Prepare Data for Pie Chart
    var groupedData = Array.from(d3.group(data, d => d.confederation), ([key, value]) => ({
      confederation: key,
      total_points: d3.sum(value, d => +d.total_points)
    }));

    // Set up Pie Chart
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var pie = d3.pie().value(function(d) { return d.total_points; });
    var arc = d3.arc().innerRadius(0).outerRadius(100);

    var arcs = pieChartSVG.selectAll("arc")
                          .data(pie(groupedData))
                          .enter()
                          .append("g")
                          .attr("class", "arc")
                          .attr("transform", "translate(200,150)");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(i); });

var legend = d3.select("body")
    .append("div")
    .attr("class", "legend")
    .style("position", "relative")
    .style("float", "left")
    .style("margin-left", "10px");

legend.append("p")
    .text("Chart Colors:")
    .style("font-weight", "bold");

legend.append("p")
    .text("Blue: UEFA (Europe)")
    .style("color", "blue")
    .style("font-size", "8px");

legend.append("p")
    .text("Orange: CONMEBOL (South America)")
    .style("color", "orange")
    .style("font-size", "8px");

legend.append("p")
    .text("Green: CONCACAF (North and Central America)")
    .style("color", "green")
    .style("font-size", "8px");

legend.append("p")
    .text("Red: CAF (Africa)")
    .style("color", "red")
    .style("font-size", "8px");

legend.append("p")
    .text("Purple: AFC (Asia)")
    .style("color", "purple")
    .style("font-size", "8px");

legend.append("p")
    .text("Brown: OFC (Oceania)")
    .style("color", "brown")
    .style("font-size", "8px");

 });
