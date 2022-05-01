// Generic json data obtainer
async function getJSONData(url) {
    const response = await fetch(url);
    return await response.json();
}

// Deterministic rune is:
//  3 x (All Non-Rune TVL) / (No. Rune in circulation) 
// tvl: Total value locked (in rune)
function GetDeterministicRuneValue(tvl, runePrice, totalRuneInCirculation) {
    // tvl is denoted in rune * 10^8
    var tvl = tvl / 100000000;
    // Half the value is bonded with non-rune assets
    // Value is denoted in rune, so we need to halve then multiply by price.
    var nonRuneTVL = (tvl / 2) * runePrice; 
    // 3x non-rune tvl must be LP'd / bonded in order to support this asset
    nonRuneTVL = nonRuneTVL * 3;

    return nonRuneTVL / totalRuneInCirculation;
}

// Get speculative multiplier
function GetSpeculativeMultiplier(currentPrice, deterministcPrice) {
    return currentPrice / deterministcPrice;
}

function test() {
    // Todo: Get better representation of this due to emissions
    const circulatingSupply = 300755174;

    // Get midgard data
    getJSONData("https://midgard.thorchain.info/v2/history/tvl?interval=day&count=400")
        .then(data => {

            // Clean data
            data = data.intervals; // Ignore metadata
            data = data.filter(item => !(item.runePriceUSD === "NaN"));

            // Add fields
            data.forEach(entry => {
                entry.deterministcPrice = GetDeterministicRuneValue(entry.totalValuePooled, entry.runePriceUSD, circulatingSupply);
                entry.speculativeMultiplier = GetSpeculativeMultiplier(entry.runePriceUSD, entry.deterministcPrice);
            });

            // Display data
            var margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 1200 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select("#my_dataviz")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            // Add X axis --> it is a date format
            var x = d3.scaleTime()
                        .domain(d3.extent(data, function(d) { return d.startTime * 1000 }))
                        .range([ 0, width ]);
                        svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3.scaleLinear()
                        //.domain([0, d3.max(data, function(d) { return d.runePriceUSD})])
                        .domain([0, 25])
                        .range([ height, 0 ]);
                        svg.append("g")
                        .call(d3.axisLeft(y));

            // Deterministic price line
            svg.append("path")
                        .datum(data)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 2)
                        .attr("d", d3.line()
                            .x(function(d) { return x(d.startTime * 1000) })
                            .y(function(d) { return y(d.deterministcPrice) })
                            )
            // Rune price line
            svg.append("path")
                        .datum(data)
                        .attr("fill", "none")
                        .attr("stroke", "red")
                        .attr("stroke-width", 2)
                        .attr("d", d3.line()
                            .x(function(d) { return x(d.startTime * 1000) })
                            .y(function(d) { return y(d.runePriceUSD) })
                            )
            // Speculative multiplier line
            svg.append("path")
                        .datum(data)
                        .attr("fill", "none")
                        .attr("stroke", "green")
                        .attr("stroke-width", 2)
                        .attr("d", d3.line()
                            .x(function(d) { return x(d.startTime * 1000) })
                            .y(function(d) { return y(d.speculativeMultiplier) })
                            )

            // Legend
            svg.append("circle").attr("cx", width - 220).attr("cy",10).attr("r", 6).style("fill", "red")
            svg.append("text").attr("x", width - 200).attr("y", 10).text("Rune Price").style("font-size", "15px").attr("alignment-baseline","middle")
            svg.append("circle").attr("cx", width - 220).attr("cy",40).attr("r", 6).style("fill", "steelblue")
            svg.append("text").attr("x", width - 200).attr("y", 40).text("Deterministic Price").style("font-size", "15px").attr("alignment-baseline","middle")
            svg.append("circle").attr("cx", width - 220).attr("cy",70).attr("r", 6).style("fill", "green")
            svg.append("text").attr("x", width - 200).attr("y", 70).text("Speculative Multiplier").style("font-size", "15px").attr("alignment-baseline","middle")
        })
        .catch(error => {
            console.error(error);
        });



    
}