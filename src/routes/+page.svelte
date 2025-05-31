<script>
  import * as d3 from 'd3';
  import NodePopover from '$lib/components/NodePopover.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';

  const { data } = $props();
  let selectedNode = $state(null);
  let triggerElement = $state(null);
  let showPopover = $state(false);
  let chartElement = $derived(chart(data));

  // Specify the dimensions of the chart.
  const width = window.innerWidth;
  const height = window.innerHeight;

  const createSimulation = (artifacts, dependencies) => {
    // Initialize all nodes at the center
    artifacts.forEach((d) => {
      d.x = width / 2;
      d.y = height / 2;
    });

    return (
      d3
        .forceSimulation(artifacts)
        // Link force with increased distance for better spacing
        .force(
          'link',
          d3
            .forceLink(dependencies)
            .id((d) => d.id)
            .distance(150)
            .strength(1)
        )
        // Stronger repulsion between nodes
        .force('charge', d3.forceManyBody().strength(-500).distanceMax(350))
        // Prevent node overlapping with larger radius
        .force('collide', d3.forceCollide().radius(50).strength(0.7).iterations(2))
        // Initial centering force that decays over time
        .force('x', d3.forceX(width / 2).strength(0.1))
        .force('y', d3.forceY(height / 2).strength(0.1))
        .velocityDecay(0.3)
        .alpha(1)
        .alphaDecay(0.02)
    );
  };

  const createSVG = () => {
    return d3
      .create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('class', 'w-full h-screen bg-black');
  };

  const chart = (data) => {
    if (!data) return null;

    let selectedNodeId = null;

    // Calculate connection counts for each node
    const connectionCounts = {};
    data.dependencies.forEach((d) => {
      connectionCounts[d.from] = (connectionCounts[d.from] || 0) + 1;
      connectionCounts[d.to] = (connectionCounts[d.to] || 0) + 1;
    });

    // Create a scale for link thickness
    const linkScale = d3
      .scaleLinear()
      .domain([1, 10]) // min and max connections (capped at 10)
      .range([1.5, 10]) // min and max thickness in pixels
      .clamp(true); // ensures values don't exceed the range

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    const dependencies = data.dependencies.map((d) => ({ ...d }));
    const artifacts = data.artifacts.map((d) => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = createSimulation(artifacts, dependencies).on('tick', ticked);

    // Create the SVG container.
    const svg = createSVG();

    // Create a group to contain all zoomable elements
    const g = svg.append('g').attr('class', 'zoom-container');

    // Initialize the links with highlighting capability
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(dependencies)
      .join('line')
      .attr('stroke', '#666')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', (d) => {
        const sourceCount = connectionCounts[d.source.id] || 0;
        const targetCount = connectionCounts[d.target.id] || 0;
        const avgConnections = (sourceCount + targetCount) / 2;
        return linkScale(avgConnections);
      })
      .attr('class', 'link-line')
      .attr('data-source', (d) => d.source.id)
      .attr('data-target', (d) => d.target.id);

    // Initialize the nodes
    const nodes = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(artifacts)
      .join('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('r', 10)
      .style('fill', (d) => color(d.artifactId));

    nodes
      .append('circle')
      .attr('r', 15)
      .style('fill', (d) => color(d.artifactId))
      .style('stroke', 'rgba(255, 255, 255, 0.3)')
      .style('stroke-width', '2');

    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 30) // Position text below the circle
      .attr('fill', 'black')
      .attr('stroke', 'white')
      .attr('stroke-width', '3')
      .attr('stroke-linejoin', 'round')
      .attr('paint-order', 'stroke')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text((d) => d.artifactId);

    // Modified node click handler
    nodes.on('click', (event, d) => {
      // Handle popover logic
      showPopover = false;
      const element = event.currentTarget;
      const bbox = element.getBoundingClientRect();
      const referenceElement = {
        getBoundingClientRect() {
          return bbox;
        }
      };
      selectedNode = d;
      triggerElement = referenceElement;
      showPopover = true;

      // Handle link highlighting
      selectedNodeId = d.id;

      // Reset all links to default state
      link.attr('stroke', '#666').attr('stroke-opacity', 0.8);

      // Highlight connected links
      link
        .filter((l) => l.source.id === selectedNodeId || l.target.id === selectedNodeId)
        .attr('stroke', '#31ee24')
        .attr('stroke-opacity', 1);

      // Add glow effect to highlighted links
      const defs = svg.append('defs');
      defs
        .append('filter')
        .attr('id', 'glow')
        .append('feGaussianBlur')
        .attr('stdDeviation', '2')
        .attr('result', 'coloredBlur');

      link
        .filter((l) => l.source.id === selectedNodeId || l.target.id === selectedNodeId)
        .attr('filter', 'url(#glow)');

      event.stopPropagation();
    });

    // Add click handler on the SVG background to reset highlighting
    svg.on('click', (event) => {
      if (event.target.tagName === 'svg') {
        link.attr('stroke', '#666').attr('stroke-opacity', 0.8).attr('filter', null);
        selectedNodeId = null;
      }
    });

    const defs = svg.append('defs');
    const filter = defs
      .append('filter')
      .attr('id', 'search-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Add zoom behavior to the SVG
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', zoomed)
      .filter((event) => {
        return event.type === 'wheel' || event.type === 'mousedown';
      });

    svg.call(zoom);

    // Enable drag behavior for nodes
    nodes.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      nodes.attr('transform', (d) => `translate(${d.x + 6},${d.y - 6})`);
    }

    function zoomed(event) {
      g.attr('transform', event.transform);
    }

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
    }

    return svg.node();
  };

  const append = (node, child) => {
    if (child) {
      node.append(child);
    }
  };
</script>

<div class="relative w-full h-screen overflow-hidden">
  {#if data}
    <div class="absolute inset-0 w-full h-full bg-black" use:append={chartElement}></div>
    <SearchBox nodes={data.artifacts} />
  {/if}

  <div class="fixed inset-0 pointer-events-none" style="z-index: 2000">
    {#if selectedNode && triggerElement && showPopover}
      <NodePopover
        node={selectedNode}
        {triggerElement}
        open={showPopover}
        on:close={() => (showPopover = false)}
      />
    {/if}
  </div>
</div>
