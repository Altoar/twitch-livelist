<template>
  <component :is="currentView" />
  {{ mainStore.twitchAccessToken }}
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

onBeforeMount(() => {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(["twitchAccessToken"]).then((result) => {
      console.log("Value get " + result.twitchAccessToken);
      mainStore.twitchAccessToken = result.twitchAccessToken as string;
    });

    chrome.storage.sync.get(["twitchData"]).then((result) => {
      console.log("Twitch Data: " + JSON.stringify(result.twitchData));
      mainStore.setTwitchData(result.twitchData as TwitchData | null);
    });
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
</style>
