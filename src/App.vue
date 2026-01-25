<template>
  <component :is="currentView" />
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import Extension from "./views/Extension.vue";
import Auth from "./views/Auth.vue";
import type { Component } from "vue";
import { useMainStore, type TwitchData } from "./stores/main";

const mainStore = useMainStore();

//Simple router
const routes: { [key: string]: Component } = {
  "": Extension,
  "index.html": Extension,
  auth: Auth
};

const currentView = computed(() => {
  const path = window.location.pathname.slice(1); // Remove '/' from the beginning
  console.log("Current path:", path);
  return routes[path] || (() => import("./views/NotFound.vue"));
});

onBeforeMount(async () => {
  if (typeof chrome !== "undefined" && chrome.storage) {
    mainStore.twitchAccessToken =
      await mainStore.getChromeStorage("twitchAccessToken");

    const twitchData: TwitchData | null =
      await mainStore.getChromeStorage("twitchData");
    console.log("Twitch Data: ", twitchData);
    mainStore.setTwitchData(twitchData);
  } else {
    console.log("chrome.runtime is undefined");
  }
});
</script>

<style lang="scss">
@use "./assets/style.scss";

html,
body,
#app {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
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
