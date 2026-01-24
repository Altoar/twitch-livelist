<template>
  <button class="base-button" :class="`base-button--${props.size || 'md'}`">
    {{ props.title }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  size?: "sm" | "md" | "lg";
}>();
</script>

<style lang="scss" scoped>
.base-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &--sm {
    font-size: 12px;
    padding: 6px 12px;
  }
  &--md {
    font-size: 16px;
    padding: 10px 20px;
  }
  &--lg {
    font-size: 20px;
    padding: 14px 28px;
  }

  &:hover {
    background-color: #2980b9;
  }
}
</style>
