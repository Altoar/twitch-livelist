<template>
  <div class="content-not-logged-in">
    <p>Please log in with Twitch to access this content.</p>
    <BaseLink :href="mainStore.authLink"
      ><BaseButton
        title="Login with Twitch"
        :icon="['fab', 'twitch']"
        size="md"
        primary
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
.content-not-logged-in {
  text-align: center;
  padding: 20px;

  p {
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 15px;
  }
}
</style>
