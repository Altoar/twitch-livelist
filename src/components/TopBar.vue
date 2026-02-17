<template>
  <div class="top-bar">
    <div class="title">Simple Twitch List</div>
    <div class="user" v-if="mainStore.isLoggedIn">
      {{ mainStore.twitchData?.user?.displayName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/main";
const mainStore = useMainStore();
</script>

<style scoped lang="scss">
.top-bar {
  background-color: var(--background-primary);
  color: var(--text-primary);
  padding: 4px 6px;
  text-align: center;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  .title {
    font-weight: bold;
  }
  .user {
    font-size: 12px;
    color: var(--text-secondary);
  }
}
</style>
