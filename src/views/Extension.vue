<template>
  <TopBar />
  <div class="main-content">
    <SideNav :current-path="currentPath" />
    <div class="content-area" v-if="twitchStore.twitchAuthStatus !== 'success'">
      <ContentLoading />
    </div>
    <div class="content-area" v-else-if="mainStore.isLoggedIn">
      <KeepAlive include="ContentChannelsManagement">
        <component :is="currentView" />
      </KeepAlive>
    </div>
    <div class="content-area" v-else>
      <ContentNotLoggedIn />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from "vue";
import TopBar from "../components/TopBar.vue";
import SideNav from "../components/SideNav.vue";
import ContentFollowsLive from "@/components/ContentFollowsLive.vue";
import ContentChannelsManagement from "@/components/ContentChannelsManagement.vue";
import ContentBrowse from "@/components/ContentBrowse.vue";
import ContentCategories from "@/components/ContentCategories.vue";
import ContentNotLoggedIn from "@/components/ContentNotLoggedIn.vue";
import ContentSettings from "@/components/ContentSettings.vue";
import ContentFavorites from "@/components/ContentFavorites.vue";
import ContentLoading from "@/components/ContentLoading.vue";
import { useMainStore } from "@/stores/main";
import { useTwitchStore } from "@/stores/twitch";
const mainStore = useMainStore();
const twitchStore = useTwitchStore();

const routes = {
  "#/followed-live": ContentFollowsLive,
  "#/favorites": ContentFavorites,
  "#/browse": ContentBrowse,
  "#/categories": ContentCategories,
  "#/settings": ContentSettings,
  "#/directory": ContentChannelsManagement
};

onBeforeMount(async () => {
  const defaultPage = await mainStore.getStorageItem("defaultPage");
  mainStore.defaultPage = defaultPage || "#/followed-live";
});

const currentPath = ref(window.location.hash);

// Clean query parameters and set initial path
const cleanPath = (path: string) => path.split("?")[0] || mainStore.defaultPage;

currentPath.value = cleanPath(window.location.hash);

window.addEventListener("hashchange", () => {
  if (currentPath.value === "#/") {
    window.location.hash = mainStore.defaultPage;
  }
  currentPath.value = cleanPath(window.location.hash); // If empty redirect to default route
});

const currentView = computed(() => {
  const path = currentPath.value || mainStore.defaultPage;
  return routes[path as keyof typeof routes] || routes[mainStore.defaultPage];
});
</script>

<style scoped lang="scss">
.main-content {
  display: flex;
  height: 100%;
  min-height: 200px;
  width: 450px;
  max-height: 550px;
}
.content-area {
  padding-top: 5px;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
