<script setup>
  defineProps({
    variant: {
      type: String,
      default: 'subtle' // 'subtle' or 'card'
    }
  })
</script>

<template>
    <table
      class="site-table"
      :class="{
        'site-table--variant-card': variant === 'card'
      }"
    >
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
    padding-bottom: 0.5rem;
    text-transform: uppercase;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: normal;
  }
  .site-table :deep(th > span) {
    opacity: 0.5;
  }
  .site-table :deep(th:not(:last-child)) {
    padding-right: 1rem;
  }
  .site-table :deep(td) {
    vertical-align: middle;
    padding-top: 0.5rem;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .site-table :deep(td:not(:last-child)) {
    padding-right: 1rem;
  }

  /* prevent a column from growing by setting their first cell to width 0 */
  .site-table :deep(tr:first-child .site-table--no-grow) {
    width: 0;
  }


  .site-table--variant-card {
    /* these variables can be overridden by setting them on tr */
    --site-table-card-border-color-rgb: var(--c-light-blue-rgb);
    --site-table-card-border-color-opacity: 0.5;
    --site-table-card-background-color-rgb: var(--c-medium-blue-rgb);
    --site-table-card-background-color-opacity: 0.5;
    border-collapse: separate;
    border-spacing: 0 1rem;
  }
  .site-table--variant-card :deep(tr) {
    margin-bottom: 1rem;
  }
  .site-table--variant-card :deep(th) {
    padding: 0 1rem;
  }
  .site-table--variant-card :deep(td) {
    padding: 1rem;
  }
  .site-table--variant-card :deep(th:last-child),
  .site-table--variant-card :deep(td:last-child) {
    padding-right: 1.5rem;
  }
  .site-table--variant-card :deep(th:first-child),
  .site-table--variant-card :deep(td:first-child) {
    padding-left: 1.5rem;
  }
  .site-table--variant-card :deep(td) {
    --site-table-card-border-color: rgba(var(--site-table-card-border-color-rgb), var(--site-table-card-border-color-opacity));
    --site-table-card-background-color: rgba(var(--site-table-card-background-color-rgb), var(--site-table-card-background-color-opacity));

    vertical-align: top;

    border: 1px solid var(--site-table-card-border-color);
    border-left-width: 0;
    border-right-width: 0;
    background-color: var(--site-table-card-background-color);
    font-size: 0.875rem;
    letter-spacing: 0.02625rem;
  }
  .site-table--variant-card :deep(td) {
    border-bottom-width: 1px;
  }
  .site-table--variant-card :deep(td:first-child) {
    border-left-width: 1px;
  }
  .site-table--variant-card :deep(td:last-child) {
    border-right-width: 1px;
  }
</style>