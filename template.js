console.log("template.js is running correctly!");

// Define dimensions and margins
const margin = { top: 30, right: 30, bottom: 40, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Load and plot Box Plot
const socialMedia = d3.csv("socialMedia.csv");

socialMedia.then(function(data) {
    data.forEach(d => d.Likes = +d.Likes);

    const svgBoxplot = d3.select("#boxplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .nice()
        .range([height, 0]);

    svgBoxplot.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    svgBoxplot.append("g")
        .call(d3.axisLeft(yScale));

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        return {
            min: d3.min(values),
            q1: d3.quantile(values, 0.25),
            median: d3.quantile(values, 0.5),
            q3: d3.quantile(values, 0.75),
            max: d3.max(values)
        };
    };

    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);
    
    quartilesByPlatform.forEach((quartiles, platform) => {
        const x = xScale(platform);
        const boxWidth = xScale.bandwidth();

        svgBoxplot.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");

        svgBoxplot.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("stroke", "black")
            .attr("fill", "lightgray");

        svgBoxplot.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black");
    });
});

// Load and plot Side-by-Side Bar Chart
const socialMediaAvg = d3.csv("SocialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const svgBarplot = d3.select("#barplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);

    svgBarplot.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svgBarplot.append("g")
        .call(d3.axisLeft(y));

    svgBarplot.selectAll(".bar-group")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x0(d.Platform) + x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", "steelblue");
});

// Load and plot Line Chart
const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const svgLineplot = d3.select("#lineplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Date))
        .range([0, width])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);

    svgLineplot.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");
    
    svgLineplot.append("g")
        .call(d3.axisLeft(yScale));

    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2)
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);
    
    svgLineplot.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line);
});
