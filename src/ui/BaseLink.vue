<template>
  <a :href="props.href" target="_blank" rel="noopener noreferrer">
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  href: string;
}>();
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
</style>
