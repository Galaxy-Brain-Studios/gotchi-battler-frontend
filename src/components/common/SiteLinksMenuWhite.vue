<script setup>
</script>
<template>
  <ul
    class="list-reset site-links-menu-white"
  >
   <slot
    :linkClasses="{ 'link-reset': true, 'link-reset--hover-underline' : true }"
    :buttonClasses="{ 'button-reset': true, 'link-reset--hover-underline' : true }"
   />
  </ul>
</template>

<style>
  .site-links-menu-white {
    min-width: 9rem;
    padding: 1rem 0.75rem;
    background: var(--c-black);
  }
  .site-links-menu-white li + li {
    margin-top: 0.5rem;
  }
  .site-links-menu-white button,
  .site-links-menu-white a,
  .site-links-menu-white a:link,
  .site-links-menu-white a:visited,
  .site-links-menu-white a:hover,
  .site-links-menu-white a:active {
    font-size: 1rem;
    letter-spacing: 0.03rem;
    line-height: 1.5rem;
    color: var(--c-white);
  }
  .site-links-menu-white .router-link-active {
    font-weight: bold;
  }
</style>