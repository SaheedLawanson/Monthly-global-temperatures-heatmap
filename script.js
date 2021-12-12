// Defining variables to be used globally
let width = 1200
let height = 600
let padding = 60

let xScale; let yScale
let xAxis; let yAxis

let minYear; let maxYear

let data; let dataset
let temp; let baseTemp

let colorMap =  ['rgb(69,117,180)', 'rgb(116,173,209)', 'rgb(171,217,233)', 'rgb(224,243,248)',
                'rgb(255,255,191)', 'rgb(254,224,144)', 'rgb(253,174,97)', 'rgb(244,109,67)',
                'rgb(215,48,39)']

// API
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

// Define svg
let svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height)

let tooltip = d3.select("#tooltip")

// Builds the scale on which the axes are to be constructed
function buildScale() {
    xScale = d3.scaleLinear()
    xScale.domain([d3.min(dataset, d => d.year-1,), d3.max(dataset, d => d.year+1)])
            .range([padding, width - padding])

    yScale = d3.scaleTime()
    yScale.domain([new Date(0,0,0,0,0,0,0), 
                    new Date(0,12,0,0,0,0,0)])
            .range([padding, height - padding])
}

// Builds the X and Y axis for drawing our heat map
function buildAxes() {
    xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('d'))
    svg.append('g')
        .attr('id', 'x-axis')
        .call(xAxis)
        .attr('transform', 'translate(0, '+(height - padding)+')')

    yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'))
    svg.append('g')
        .attr('id', 'y-axis')
        .call(yAxis)
        .attr('transform', 'translate('+padding+', 0)')
}

// Creating the heat map
function drawMap() {
    minYear = d3.min(dataset, d => d.year)
    maxYear = d3.max(dataset, d => d.year)

    svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('class', 'cell')

        // Color each rectangle based on the temperature value it represents
        .attr('fill', d => {
            temp = baseTemp + d.variance
            
            if(temp <= 2.8){return colorMap[0]}
            else if(temp <= 3.9){return colorMap[1]}
            else if(temp <= 6.1){return colorMap[2]}
            else if(temp <= 7.2){return colorMap[3]}
            else if(temp <= 8.3){return colorMap[4]}
            else if(temp <= 9.5){return colorMap[5]}
            else if(temp <= 10.6){return colorMap[6]}
            else if(temp <= 11.7){return colorMap[7]}
            else {return colorMap[8]}
        })

        .attr('height', (height-(2*padding))/12)
        .attr('y', d => yScale(new Date(0,d.month-1,0,0,0,0,0)))
        .attr('width', (width - 2*padding)/(maxYear - minYear))
        .attr('x', d => xScale(d.year))

        // Makes tooltip visible text visible on mouse over event
        .on('mouseover', d => {
            tooltip.transition()
                .style('visibility', 'visible')

            d = d.srcElement.__data__
            tooltip.text(d.year+" - "+d.month+"\n\n"+(baseTemp - d.variance)+"\n"+d.variance)
            tooltip.attr('data-year', d.year)
        })

        // Hides tool tip on mouse out event
        .on('mouseout', d => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
}

// Creating the legend
let legend = d3.select('body').append('svg')
                .attr('id', 'legend')

legend.selectAll('rect')
        .data(colorMap)
        .enter()
        .append('rect')
        .attr('class', 'legend-items')
        .attr('x', (d, i) => i*40)
        .attr('y', 0)
        .attr('fill', (d, i) => colorMap[i])

// Pull API
let req = new XMLHttpRequest()
req.open('GET', url, true)
req.send()
req.onload = () => {
    data = JSON.parse(req.responseText)
    baseTemp = data.baseTemperature
    dataset = data.monthlyVariance

    // Testing area
    
    // Run pipeline
    buildScale()
    
    buildAxes()

    drawMap()
}
