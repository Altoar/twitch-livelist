<template>
  <div class="sidenav">
    <div class="sidenav__navigation">
      <a href="#/follows" class="sidenav__nav-item">Follows</a>
      <a href="#/browse" class="sidenav__nav-item">Browse</a>
      <a href="#/follows" class="sidenav__nav-item">Follows</a>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.sidenav {
  width: 50px;
  border-right: 1px solid var(--border-primary);
  height: 100%;

  &__navigation {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &__nav-item {
    color: var(--text-primary);
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    text-align: center;
    text-decoration: none;

    &:hover {
      background-color: var(--background-secondary);
      color: var(--accent-color);
    }
  }
}
</style>
