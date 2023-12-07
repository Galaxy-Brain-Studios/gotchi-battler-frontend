<script setup>
</script>

<template>
    <table class="site-table">
      <slot />
    </table>
</template>

<style scoped>
  .site-table {
    width: 100%;
    margin-bottom: 2rem;
    border: none;
  }

  .site-table :deep(th) {
    white-space: nowrap;
    text-align: left;
    padding-bottom: 1.5rem;
    text-transform: uppercase;
    font-size: 1.125rem;
    line-height: 1.5rem;
  }
  .site-table :deep(th > span) {
    opacity: 0.5;
  }
  .site-table :deep(th:not(:last-child)) {
    padding-right: 1rem;
  }
  .site-table :deep(td) {
    vertical-align: top;
    padding-top: 1rem;
    font-size: 1.5rem;
    line-height: 2rem;
    letter-spacing: 0.045rem;
  }
  .site-table :deep(td:not(:last-child)) {
    padding-right: 1rem;
  }

  /* prevent a column from growing by setting their first cell to width 0 */
  .site-table :deep(tr:first-child .site-table--no-grow) {
    width: 0;
  }
</style>