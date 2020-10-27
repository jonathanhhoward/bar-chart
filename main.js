const datasetURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

d3.json(datasetURL)
  .then(dataset => dataset.data.map(d => ({
    date: d[0],
    gdp: d[1],
  })))
  .then(barChart)
  .catch(console.error);

function barChart(dataset) {
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight * 0.99;
  const margin = { top: 50, right: 50, bottom: 50, left: 100 };

  const root = d3.select('#root');

  const svg = root.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  svg.append('text')
    .attr('id', 'title')
    .attr('class', 'title')
    .attr('x', svgWidth * 0.5)
    .attr('y', margin.top * 0.75)
    .text('United States GDP');

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const xScale = d3.scaleBand()
    .domain(dataset.map(d => d.date))
    .padding(0.2)
    .range([0, chartWidth]);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(d => {
      const year = +d.match(/\d{4}/);
      const month = d.match(/\d{4}-(\d{2})/)[1];
      return year % 5 === 0 && month === '01';
    }))
    .tickFormat(d => d.match(/\d{4}/))
    .tickSizeOuter(0);

  chart.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(xAxis);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.gdp)])
    .range([chartHeight, 0]);

  const yAxis = d3.axisLeft(yScale)
    .tickSizeOuter(0);

  chart.append('g')
    .attr('id', 'y-axis')
    .call(yAxis);

  chart.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.date))
    .attr('y', d => yScale(d.gdp))
    .attr('width', xScale.bandwidth())
    .attr('height', d => yScale(0) - yScale(d.gdp))
    .attr('data-date', d => d.date)
    .attr('data-gdp', d => d.gdp)
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);

  const tooltip = root.append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip');

  function showTooltip(event, data) {
    const w = 100;
    const h = 50;
    const offset = 20;
    const { pageX, pageY } = event;
    const left = pageX + offset;
    const top = pageY + offset;
    const right = (svgWidth - pageX) + offset;
    const bottom = (svgHeight - pageY) + offset;
    const isOverflowX = left + w > svgWidth;
    const isOverflowY = top + h > svgHeight;

    tooltip.attr('data-date', data.date)
      .html(
        `${(d3.utcFormat('%Y Q%q')(new Date(data.date)))}<br>` +
        `${(d3.format('$,.1f')(data.gdp))}`,
      )
      .style('left', isOverflowX ? '' : `${left}px`)
      .style('top', isOverflowY ? '' : `${top}px`)
      .style('right', isOverflowX ? `${right}px` : '')
      .style('bottom', isOverflowY ? `${bottom}px` : '')
      .style('display', 'block');
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }
}
