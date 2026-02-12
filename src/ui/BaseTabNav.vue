<template>
  <div class="base-tab-nav">
    <InvisibleButton
      v-for="tab in tabs"
      :key="tab.name"
      :class="[
        'base-tab-nav__button',
        { 'base-tab-nav__button--active': activeTab === tab.name }
      ]"
      @click="$emit('update:activeTab', tab.name)">
      {{ tab.label }}
    </InvisibleButton>
  </div>
</template>

<script setup lang="ts">
import InvisibleButton from "./InvisibleButton.vue";

defineEmits<{
  "update:activeTab": [tabName: string];
}>();

const props = defineProps<{
  activeTab: string;
  tabs: { name: string; label: string }[];
}>();
</script>
<style lang="scss" scoped>
.base-tab-nav {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  width: 100%;
  gap: 0;

  &__button {
    flex: 1;
    padding: 8px 12px;
    cursor: pointer;
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s;

    &--active {
      color: var(--text-primary);
      border-color: var(--accent-color);
    }
  }
}
</style>
