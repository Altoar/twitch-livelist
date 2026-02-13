<template>
  <div class="sidenav">
    <div class="sidenav__navigation">
      <a
        :href="item.link"
        class="sidenav__nav-item"
        :title="item.name"
        v-tooltip.right="item.name"
        :class="{
          'sidenav__nav-item--active': props.currentPath === item.link
        }"
        v-for="item in nav"
        :key="item.name"
        ><Icon :icon="item.icon" size="lg" />
        <div
          class="sidenav__live-count-badge"
          v-if="item.link === '#/followed-live'">
          {{ twitchStore.followedLiveChannels.length }}
        </div>
        <div
          class="sidenav__live-count-badge"
          v-else-if="item.link === '#/favorites'">
          {{ twitchStore.favoriteLiveChannels.length }}
        </div>
      </a>
    </div>
    <div class="sidenav__bottomnav">
      <a
        href="#/settings"
        class="sidenav__nav-item"
        :class="{
          'sidenav__nav-item--active': props.currentPath === '#/settings'
        }"
        v-tooltip.right="'Settings'"
        ><Icon :icon="'gear'" size="lg" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTwitchStore } from "@/stores/twitch";
const twitchStore = useTwitchStore();

const props = defineProps<{
  currentPath: string;
}>();

const nav = ref([
  { name: "Live Followed", icon: "heart", link: "#/followed-live" },
  { name: "Favorites", icon: "star", link: "#/favorites" },
  { name: "Browse", icon: "list", link: "#/browse" },
  { name: "Categories", icon: "gamepad", link: "#/categories" },
  { name: "Directory", icon: "address-book", link: "#/directory" }
]);
</script>

<style scoped lang="scss">
.sidenav {
  width: 40px;
  border-right: 1px solid var(--border-primary);
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &__navigation {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__bottomnav {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__nav-item {
    color: var(--text-primary);
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    text-align: center;
    text-decoration: none;
    width: 100%;
    position: relative;

    &:hover,
    &--active {
      background-color: var(--background-secondary);
      color: var(--accent-color);
    }
  }

  &__live-count-badge {
    position: absolute;
    bottom: 4px;
    right: 4px;
    font-weight: bold;
    background-color: var(--accent-color);
    color: white;
    border-radius: 12px;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    min-width: 10px;
    text-align: center;
    height: 10px;
  }
}
</style>
