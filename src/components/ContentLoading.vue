<template>
  <div class="content-loading">
    <Icon icon="spinner" size="3x" class="content-loading__icon" spin />
  </div>
</template>

<style lang="scss" scoped>
.content-loading {
  &__icon {
    color: var(--color-primary);
    margin: 40px auto;
    display: block;
  }
}
</style>
