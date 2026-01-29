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
  square?: boolean;
  transparent?: boolean;
  primary?: boolean;
  secondary?: boolean;
  danger?: boolean;
}>();

const classes = computed(() => {
  return {
    "base-button": true,
    [`base-button--${props.size || "md"}`]: true,
    "base-button--loading": props.loading || false,
    "base-button--square": props.square || false,
    "base-button--transparent": props.transparent || false,
    "base-button--primary": props.primary || false,
    "base-button--secondary": props.secondary || false,
    "base-button--danger": props.danger || false
  };
});
</script>

<style lang="scss" scoped>
.base-button {
  padding: 10px 20px;
  background-color: transparent;
  color: var(--text-primary);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &--primary {
    background-color: var(--button-primary);
    &:hover {
      background-color: var(--button-primary-hover);
    }
  }

  &--secondary {
    background-color: var(--button-secondary);
    &:hover {
      background-color: var(--button-secondary-hover);
    }
  }

  &--transparent {
    background-color: transparent;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  &--danger {
    background-color: var(--button-danger);
    &:hover {
      background-color: var(--button-danger-hover);
    }
  }

  &--sm {
    font-size: 12px;
    padding: 6px 12px;
  }
  &--md {
    font-size: 14px;
    padding: 8px 16px;
  }
  &--lg {
    font-size: 18px;
    padding: 12px 22px;
  }

  &--square {
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
