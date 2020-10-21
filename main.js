const datasetURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

d3.json(datasetURL)
  .then(dataset => {
    const datamap = dataset.data.map(d => ({
      date: d[0],
      gdp: d[1],
    }));
    barChart(datamap);
  })
  .catch(console.error);

function barChart(dataset) {
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight * 0.99;
  const margin = { top: 50, right: 50, bottom: 50, left: 100 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;
  const barWidth = (chartWidth / dataset.length) * 0.8;

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, d => new Date(d.date)))
    .range([0, chartWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.gdp)])
    .range([chartHeight, 0]);

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

  chart.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScale));

  chart.append('g')
    .attr('id', 'y-axis')
    .call(d3.axisLeft(yScale));

  chart.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(new Date(d.date)))
    .attr('y', d => yScale(d.gdp))
    .attr('width', barWidth)
    .attr('height', d => yScale(0) - yScale(d.gdp))
    .attr('data-date', d => d.date)
    .attr('data-gdp', d => d.gdp)
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);

  const tooltip = root.append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip');

  function showTooltip(event, data) {
    const dx = 20;
    const dy = 20;
    const w = 100;
    const h = 50;
    const { pageX, pageY } = event;
    const { innerWidth, innerHeight } = window;
    const isOverflowX = pageX + dx + w > innerWidth;
    const isOverflowY = pageY + dy + h > innerHeight;
    const date = d3.utcFormat('%Y Q%q')(new Date(data.date));
    const gdp = d3.format('$,.1f')(data.gdp);

    tooltip.attr('data-date', data.date)
      .html(`${date}<br>${gdp}`)
      .style('left', isOverflowX ? '' : `${pageX + dx}px`)
      .style('top', isOverflowY ? '' : `${pageY + dy}px`)
      .style('right', isOverflowX ? `${innerWidth - pageX + dx}px` : '')
      .style('bottom', isOverflowY ? `${innerHeight - pageY + dy}px` : '')
      .style('display', 'block');
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }
}
