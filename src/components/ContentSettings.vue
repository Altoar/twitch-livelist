<template>
  <div class="content-settings">
    <h2>Settings</h2>
    <div class="content-settings__section">
      <h3>Notifications</h3>
      <div class="content-settings__notification-item">
        <span>Enable Desktop Notifications</span>
        <BaseToggle
          v-model="mainStore.isDesktopNotificationsEnabled"
          @update:model-value="
            mainStore.toggleDesktopNotifications($event as boolean)
          " />
      </div>
      <div class="content-settings__notification-item">
        <span>Silent Notifications</span>
        <BaseToggle
          v-model="mainStore.isNotificationSilent"
          @update:model-value="
            mainStore.toggleSilentNotifications($event as boolean)
          " />
      </div>
    </div>
    <div class="content-settings__section">
      <h3>Connection</h3>
      <BaseButton
        size="sm"
        title="Disconnect Twitch"
        danger
        icon="arrow-right-from-bracket"
        @click="mainStore.logoutTwitch()" />
    </div>
    <div class="content-settings__section">
      <h3>About</h3>

      GitHub:
      <BaseLink href="https://github.com/Altoar/twitch-livelist" type="text"
        >https://github.com/Altoar/twitch-livelist</BaseLink
      >
    </div>

    <div class="content-settings__footer">
      This browser extension is not affiliated with Twitch Interactive, Inc.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/main";
import BaseButton from "@/ui/BaseButton.vue";
import BaseLink from "@/ui/BaseLink.vue";
import BaseToggle from "@/ui/BaseToggle.vue";
const mainStore = useMainStore();
</script>

<style lang="scss" scoped>
.content-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
    color: var(--text-primary);
  }

  h3 {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 10px;
  }
  &__section {
    margin-top: 15px;
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: 20px;
  }

  &__notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--text-primary);
  }

  &__footer {
    text-align: center;
    margin-top: auto;
    margin-top: auto;
    padding: 20px;
    font-size: 10px;
    color: var(--text-secondary);
  }
}
</style>
