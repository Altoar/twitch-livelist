<template>
  <div :class="['base-select', { 'base-select--open': isOpen }]">
    <div class="base-select__selected" @click="toggleOpen">
      <span>{{ selectedOptionLabel }}</span>
      <i class="icon-chevron-down"></i>
    </div>
    <div v-if="isOpen" class="base-select__options">
      <div
        v-for="option in options"
        :key="option.value"
        class="base-select__option"
        @click="selectOption(option)">
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
const props = defineProps<{
  options: { label: string; value: string }[];
}>();

const model = defineModel<string | null>("modelValue");

const isOpen = ref(false);
const selectedOption = ref(
  props.options.find((opt) => opt.value === model.value) || null
);

const selectedOptionLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : "Select...";
});

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function selectOption(option: { label: string; value: string }) {
  selectedOption.value = option;
  model.value = option.value;
  isOpen.value = false;
}

watch(
  () => model.value,
  (newValue) => {
    selectedOption.value =
      props.options.find((opt) => opt.value === newValue) || null;
  }
);

// Close dropdown when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  const selectElement = document.querySelector(".base-select");
  if (selectElement && !selectElement.contains(target)) {
    isOpen.value = false;
  }
}

// Add/remove event listener based on dropdown state
watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener("click", handleClickOutside);
  } else {
    document.removeEventListener("click", handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.base-select {
  position: relative;
  width: 120px;
  font-family: Arial, sans-serif;
  font-size: 14px;

  &__selected {
    padding: 2px;
    border: 1px solid var(--border-primary);
    border-radius: 5px;
    background-color: var(--background-select);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background-color: var(--background-select-hover);
    }
  }

  &__options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--background-select);
    border: 1px solid var(--border-primary);
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    border-radius: 0 0 5px 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }

  &__option {
    padding: 2px;
    cursor: pointer;

    &:hover {
      background-color: var(--background-select-hover);
    }
  }
}
</style>
