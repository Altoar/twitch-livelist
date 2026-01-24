<template>
  <template v-if="accessToken">
    <p>Successfully authenticated with token</p>
  </template>
  <template v-else-if="authError">
    <p>Error during authentication. Please try again</p>
  </template>
  <template v-else>
    <p>Please log in with Twitch to continue.</p>
    <BaseLink :href="mainStore.authLink"
      ><BaseButton title="Login with Twitch"
    /></BaseLink>
  </template>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import BaseButton from "../ui/BaseButton.vue";
import BaseLink from "../ui/BaseLink.vue";
import { useMainStore } from "../stores/main";
const mainStore = useMainStore();

const accessToken = computed(() => {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.slice(1)); // Remove '#' from the beginning
  return params.get("access_token");
});

const authError = computed(() => {
  // If error parameter exists in URL, return it
  return new URLSearchParams(window.location.search).get("error");
});

onBeforeMount(() => {
  if (accessToken.value) {
    console.log("Access Token found: " + accessToken.value);
    mainStore.authenticateTwitch(accessToken.value);
  }
});
</script>
