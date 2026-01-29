<template>
  <component :is="currentView" />
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import Extension from "./views/Extension.vue";
import Auth from "./views/Auth.vue";
import type { Component } from "vue";
import { useMainStore, type TwitchData } from "./stores/main";
import { useTwitchStore } from "./stores/twitch";
const twitchStore = useTwitchStore();

const mainStore = useMainStore();

//Simple router
const routes: { [key: string]: Component } = {
  "": Extension,
  "index.html": Extension,
  auth: Auth
};

const currentView = computed(() => {
  const path = window.location.pathname.slice(1); // Remove '/' from the beginning
  return routes[path] || (() => import("./views/NotFound.vue"));
});

onBeforeMount(async () => {
  const accessToken = await mainStore.getStorageItem("twitchAccessToken");

  // Only set the access token in the store if it exists in storage to avoid overwriting with null
  if (accessToken) {
    mainStore.twitchAccessToken = accessToken;
    twitchStore.validateToken();

    const twitchData: TwitchData | null =
      await mainStore.getStorageItem("twitchData");

    mainStore.setTwitchData(twitchData);
  }

  // Load user preferences from storage
  const isFollowedChannelsReverseOrder = await mainStore.getStorageItem(
    "isFollowedChannelsReverseOrder"
  );
  twitchStore.isFollowedChannelsReverseOrder = !!isFollowedChannelsReverseOrder;

  const isDesktopNotificationsEnabled = await mainStore.getStorageItem(
    "desktopNotifications"
  );
  mainStore.isDesktopNotificationsEnabled =
    isDesktopNotificationsEnabled ?? true;

  const isNotificationSilent = await mainStore.getStorageItem(
    "silentNotifications"
  );
  mainStore.isNotificationSilent = isNotificationSilent ?? true;

  const disabledNotificationChannelIds = await mainStore.getStorageItem(
    "disabledNotificationChannelIds"
  );
  twitchStore.disabledNotificationChannelIds =
    disabledNotificationChannelIds || [];
});
</script>

<style lang="scss">
@use "./assets/style.scss";
@import "floating-vue/dist/style.css";

html,
body,
#app {
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-primary);
  color: var(--text-primary);
  height: 100%;
  width: 100%;
}
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary, #2f2f2f);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-color, #9147ff);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-hover, #772ce8);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--accent-color, #9147ff)
    var(--background-secondary, #2f2f2f);
}
</style>
