<template>
  <div
    class="base-toggle"
    :class="{ 'base-toggle--checked': model }"
    @click="toggle">
    <div class="base-toggle__knob"></div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<boolean>();

function toggle() {
  model.value = !model.value;
}
</script>

<style lang="scss" scoped>
.base-toggle {
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: var(--toggle-bg);
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;

  &__knob {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--toggle-knob);
    position: absolute;
    top: 1px;
    left: 1px;
    transition: left 0.2s;
  }

  &--checked {
    background-color: var(--toggle-bg-checked);

    & .base-toggle__knob {
      left: 21px;
    }
  }
}
</style>
