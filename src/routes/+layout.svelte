<script>
  import '../app.css';
  let { children } = $props();
</script>

<div class="main-content dark h-full">
  {@render children()}
</div>

<!-- Portal container for popovers -->
<div id="popover-container"></div>
