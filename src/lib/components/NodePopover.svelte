<script>
  import { computePosition, autoPlacement, offset, shift } from '@floating-ui/dom';
  import { createEventDispatcher, onMount } from 'svelte';

  let { node, triggerElement, open } = $props();
  let popoverElement = $state(null);
  let position = $state({ x: 0, y: 0 });

  const dispatch = createEventDispatcher();

  function updatePosition() {
    if (!triggerElement || !popoverElement) return;

    computePosition(triggerElement, popoverElement, {
      placement: 'top',
      middleware: [
        offset(16),
        autoPlacement({
          padding: 16,
          allowedPlacements: ['top', 'bottom', 'left', 'right']
        }),
        shift({ padding: 16 })
      ]
    }).then(({ x, y }) => {
      position = { x, y };
    });
  }

  function handleClickOutside(event) {
    if (popoverElement && !popoverElement.contains(event.target)) {
      dispatch('close');
      event.stopPropagation();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  $effect(() => {
    if (open && triggerElement && popoverElement) {
      updatePosition();
    }
  });
</script>

<div
  bind:this={popoverElement}
  class="card variant-filled-surface"
  style="
        left: {position.x}px;
        top: {position.y}px;
        z-index: 100;
        position: fixed;
        pointer-events: auto;
        border-radius: 1.25rem;
        padding: 0.5rem;
        background: linear-gradient(145deg, var(--color-surface-500), var(--color-surface-600));
        box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.3),
            0 4px 6px -4px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        transform: translate3d(0, 0, 0);
        border: 1px solid rgba(255, 255, 255, 0.1);
    "
>
  <div class="p-8">
    <div class="table-container">
      <table class="table-hover border-spacing-2">
        <tbody>
          <tr class="hover:bg-primary-800/30 transition-colors">
            <td class="text-white/60 pr-4 py-2 font-semibold">Name: </td>
            <td class="text-white py-2">{node.artifactId}</td>
          </tr>
          <tr class="hover:bg-primary-800/30 transition-colors">
            <td class="text-white/60 pr-4 py-2 font-semibold">Group: </td>
            <td class="text-white py-2">{node.groupId}</td>
          </tr>
          <tr class="hover:bg-primary-800/30 transition-colors">
            <td class="text-white/60 pr-4 py-2 font-semibold">Version: </td>
            <td class="text-white py-2">{node.version}</td>
          </tr>
          {#if node.scopes}
            <tr class="hover:bg-primary-800/30 transition-colors">
              <td class="text-white/60 pr-4 py-2 font-semibold">Scopes: </td>
              <td class="text-white py-2">{node.scopes.join(',')}</td>
            </tr>
          {/if}
          <tr class="hover:bg-primary-800/30 transition-colors">
            <td class="text-white/60 pr-4 py-2 font-semibold">Used In: </td>
            <td class="text-white py-2">{node.usedIn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
