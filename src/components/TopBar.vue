<template>
  <div class="top-bar">
    <div class="title">Twitch Live List</div>
    <div class="user" v-if="mainStore.isLoggedIn">
      {{ mainStore.twitchData?.user?.displayName }}
      <BaseButton title="Logout" size="sm" @click="mainStore.logoutTwitch()" />
    </div>
    <BaseLink :href="mainStore.authLink" v-else
      ><BaseButton title="Login with Twitch" size="sm"
    /></BaseLink>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/main";
import BaseButton from "@/ui/BaseButton.vue";
import BaseLink from "@/ui/BaseLink.vue";
const mainStore = useMainStore();
</script>

<style scoped lang="scss">
.top-bar {
  background-color: var(--background-primary);
  color: var(--text-primary);
  padding: 6px;
  text-align: center;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: bold;
  }

  .user {
    font-size: 14px;
  }
}
</style>
