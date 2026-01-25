<template>
  <button :class="classes" :disabled="props.loading">
    <Icon v-if="props.icon && !props.loading" :icon="props.icon"></Icon>
    <Icon v-else-if="props.loading" icon="spinner" spin></Icon>
    {{ props.title }}
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  title?: string;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: string | [string, string];
}>();

const classes = computed(() => {
  return {
    "base-button": true,
    [`base-button--${props.size || "md"}`]: true,
    "base-button--loading": props.loading || false
  };
});
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
