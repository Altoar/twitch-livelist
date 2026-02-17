<template>
  <div class="content-settings">
    <h2>Settings</h2>
    <div class="content-settings__section">
      <h3>Notifications</h3>
      <div class="content-settings__setting-item">
        <span>Enable notifications</span>
        <BaseToggle
          v-model="mainStore.isDesktopNotificationsEnabled"
          @update:model-value="
            mainStore.toggleDesktopNotifications($event as boolean)
          " />
      </div>
      <div class="content-settings__setting-item">
        <span>Silent notifications</span>
        <BaseToggle
          v-model="mainStore.isNotificationSilent"
          @update:model-value="
            mainStore.toggleSilentNotifications($event as boolean)
          " />
      </div>

      <div class="content-settings__setting-item">
        <span>Stream goes live</span>
        <BaseSelect
          v-model="mainStore.notificationChannelsType"
          :options="notificationOptions"
          @update:model-value="
            mainStore.setNotificationChannelsType(
              $event as
                | 'followed-only'
                | 'favorited-only'
                | 'followed-and-favorited'
            )
          "
          style="width: 130px" />
      </div>
    </div>
    <div class="content-settings__section">
      <h3>Other</h3>
      <div class="content-settings__setting-item">
        <span>Default page</span>
        <BaseSelect
          v-model="mainStore.defaultPage"
          :options="pages"
          @update:model-value="
            mainStore.setDefaultPage(
              $event as '#/followed-live' | '#/favorites'
            )
          "
          style="width: 130px" />
      </div>
      <div class="content-settings__setting-item">
        <span>Badge live channels number</span>
        <BaseSelect
          v-model="mainStore.badgeLiveChannelsNumberType"
          :options="badgeOptions"
          @update:model-value="
            mainStore.setbadgeLiveChannelsNumberType(
              $event as
                | 'followed-only'
                | 'favorited-only'
                | 'followed-and-favorited'
            )
          "
          style="width: 130px" />
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
      <BaseLink href="https://github.com/Altoar/SimpleTwitchList" type="text"
        >https://github.com/Altoar/SimpleTwitchList</BaseLink
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
import BaseSelect from "@/ui/BaseSelect.vue";
const mainStore = useMainStore();

const pages = [
  { label: "Live Followed", value: "#/followed-live" },
  { label: "Favorites", value: "#/favorites" }
];

const badgeOptions = [
  { label: "Followed only", value: "followed-only" },
  { label: "Favorited only", value: "favorited-only" },
  {
    label: "Both combined",
    value: "followed-and-favorited"
  }
];

const notificationOptions = [
  { label: "Followed only", value: "followed-only" },
  { label: "Favorited only", value: "favorited-only" },
  {
    label: "Both combined",
    value: "followed-and-favorited"
  }
];
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
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: 10px;
  }

  &__setting-item {
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
    padding: 20px;
    font-size: 10px;
    color: var(--text-secondary);
  }
}
</style>
