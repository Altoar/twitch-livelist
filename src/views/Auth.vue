<template>
  <div class="auth-view">
    <template v-if="accessToken">
      <ContentLoading v-if="mainStore.twitchAuthStatus === 'loading'" />
      <template v-else-if="mainStore.twitchAuthStatus === 'success'">
        <p>Successfully logged in with Twitch. You can now close this tab.</p>
      </template>
      <template v-else-if="mainStore.twitchAuthStatus === 'error'">
        <p>Error during authentication. Please try again</p>
      </template>
    </template>
    <template v-else-if="authError">
      <p>Error during authentication. Please try again</p>
    </template>
    <template v-else>
      <p>Please log in with Twitch to continue.</p>
      <BaseLink :href="mainStore.authLink"
        ><BaseButton title="Login with Twitch" primary
      /></BaseLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import BaseButton from "../ui/BaseButton.vue";
import BaseLink from "../ui/BaseLink.vue";
import { useMainStore } from "../stores/main";
import ContentLoading from "../components/ContentLoading.vue";
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
    mainStore.authenticateTwitch(accessToken.value);
  }
});
</script>

<style scoped lang="scss">
.auth-view {
  padding: 20px;
  text-align: center;

  p {
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 15px;
  }
}
</style>
