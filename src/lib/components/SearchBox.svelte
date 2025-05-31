<script>
  import * as d3 from 'd3';

  const { nodes } = $props();
  let searchTerm = $state('');

  $effect(() => {
    const searchTermLower = searchTerm.toLowerCase();

    // Get the D3 selection for all node circles
    const nodeCircles = d3.selectAll('.nodes g circle');

    // Reset all nodes to default state
    nodeCircles
      .style('filter', null)
      .style('stroke', 'rgba(255, 255, 255, 0.3)')
      .style('stroke-width', '2');

    if (searchTermLower) {
      // Find matching nodes
      const matchedNodeIds = nodes
        .filter((node) => {
          // Search through artifactId specifically
          return node.artifactId.toLowerCase().includes(searchTermLower);
        })
        .map((node) => node.id);

      if (matchedNodeIds.length > 0) {
        // Update matched nodes
        nodeCircles
          .filter((d) => matchedNodeIds.includes(d.id))
          .style('filter', 'url(#search-glow)')
          .style('stroke', '#31ee24')
          .style('stroke-width', '3');
      }
    }
  });
</script>

<style>
  .search-container {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 9999;
    width: 300px;
  }

  .search-input {
    width: 100%;
    height: 40px;
    padding: 8px 36px 8px 12px;
    background-color: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 16px;
  }

  .search-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .clear-button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
  }

  .clear-button:hover {
    color: white;
  }
</style>

<div class="search-container">
  <input type="text" bind:value={searchTerm} placeholder="Search nodes..." class="search-input" />
  {#if searchTerm}
    <button class="clear-button" onclick={() => (searchTerm = '')}> × </button>
  {/if}
</div>
