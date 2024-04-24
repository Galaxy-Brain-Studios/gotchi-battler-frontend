<script setup>
  defineProps({
    pattern: {
      type: Object,
      required: true
    }
  })
</script>

<template>
  <div class="formation-pattern">
    <div
      class="formation-pattern__image"
      :style="{
        '--pattern-back-0': pattern.back[0] ? 0 : 1,
        '--pattern-back-1': pattern.back[1] ? 0 : 1,
        '--pattern-back-2': pattern.back[2] ? 0 : 1,
        '--pattern-back-3': pattern.back[3] ? 0 : 1,
        '--pattern-back-4': pattern.back[4] ? 0 : 1,
        '--pattern-front-0': pattern.front[0] ? 0 : 1,
        '--pattern-front-1': pattern.front[1] ? 0 : 1,
        '--pattern-front-2': pattern.front[2] ? 0 : 1,
        '--pattern-front-3': pattern.front[3] ? 0 : 1,
        '--pattern-front-4': pattern.front[4] ? 0 : 1
      }"
    />
    <div class="formation-pattern__name">
      {{ pattern.name }}
    </div>
  </div>
</template>

<style scoped>
  .formation-pattern {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .formation-pattern__image {
    flex: none;

    --formation-pattern-border-width: 2px;
    width:  calc(5rem + 2 * var(--formation-pattern-border-width));
    height: calc(2rem + 2 * var(--formation-pattern-border-width));
    border: var(--formation-pattern-border-width) solid #fff;
    /* generate formation block pattern using linear-gradients with sharp color/opacity changes */
    background-image:
      /* display a tiny gotchi at every position */
      url('./pattern-gotchi.png'),
      /* front row, with unoccupied spaces filled in with opaque white */
      linear-gradient(90deg,
        rgba(255, 255, 255, var(--pattern-front-0)) 0%,
        rgba(255, 255, 255, var(--pattern-front-0)) 20%,
        rgba(255, 255, 255, var(--pattern-front-1)) 20%,
        rgba(255, 255, 255, var(--pattern-front-1)) 40%,
        rgba(255, 255, 255, var(--pattern-front-2)) 40%,
        rgba(255, 255, 255, var(--pattern-front-2)) 60%,
        rgba(255, 255, 255, var(--pattern-front-3)) 60%,
        rgba(255, 255, 255, var(--pattern-front-3)) 80%,
        rgba(255, 255, 255, var(--pattern-front-4)) 80%,
        rgba(255, 255, 255, var(--pattern-front-4)) 100%
      ),
      /* back row, with unoccupied spaces filled in with opaque white */
      linear-gradient(90deg,
        rgba(255, 255, 255, var(--pattern-back-0)) 0%,
        rgba(255, 255, 255, var(--pattern-back-0)) 20%,
        rgba(255, 255, 255, var(--pattern-back-1)) 20%,
        rgba(255, 255, 255, var(--pattern-back-1)) 40%,
        rgba(255, 255, 255, var(--pattern-back-2)) 40%,
        rgba(255, 255, 255, var(--pattern-back-2)) 60%,
        rgba(255, 255, 255, var(--pattern-back-3)) 60%,
        rgba(255, 255, 255, var(--pattern-back-3)) 80%,
        rgba(255, 255, 255, var(--pattern-back-4)) 80%,
        rgba(255, 255, 255, var(--pattern-back-4)) 100%
      );
    background-size: 20% 50%, 100% 50%, 100% 50%;
    background-repeat: repeat, no-repeat, no-repeat;
    background-position: top, top, bottom;
  }
  .formation-pattern__name {
    flex: 1 1 auto;
    padding: 0 1rem;
    color: var(--c-white);
    font-size: 0.875rem;
    letter-spacing: 0.02625rem;
    line-height: 1.5rem;
    font-weight: bold;
  }
</style>