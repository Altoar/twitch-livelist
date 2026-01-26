<template>
  <TopBar />
  <div class="main-content">
    <SideNav :current-path="currentPath" />
    <div class="content-area" v-if="mainStore.isLoggedIn">
      <component :is="currentView" />
    </div>
    <div class="content-area" v-else>
      <ContentNotLoggedIn />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import TopBar from "../components/TopBar.vue";
import SideNav from "../components/SideNav.vue";
import ContentFollowsLive from "@/components/ContentFollowsLive.vue";
import ContentFollowsAll from "@/components/ContentFollowsAll.vue";
import ContentBrowse from "@/components/ContentBrowse.vue";
import ContentCategories from "@/components/ContentCategories.vue";
import ContentNotLoggedIn from "@/components/ContentNotLoggedIn.vue";
import ContentSettings from "@/components/ContentSettings.vue";
import { useMainStore } from "@/stores/main";
const mainStore = useMainStore();

const routes = {
  "/followed-live": ContentFollowsLive,
  "/browse": ContentBrowse,
  "/categories": ContentCategories,
  "/settings": ContentSettings,
  "/followed-all": ContentFollowsAll
};

const defaultRoute = "/followed-live";

const currentPath = ref(window.location.hash);

// Clean query parameters and set initial path
const cleanPath = (path: string) => path.split("?")[0] || defaultRoute;

currentPath.value = cleanPath(window.location.hash);

window.addEventListener("hashchange", () => {
  currentPath.value = cleanPath(window.location.hash);
});

const currentView = computed(() => {
  const path = currentPath.value.slice(1) || defaultRoute.slice(1);
  return routes[path as keyof typeof routes] || routes[defaultRoute];
});
</script>

<style scoped lang="scss">
.main-content {
  display: flex;
  height: 100%;
  min-height: 200px;
  width: 450px;
  max-height: 500px;
}
.content-area {
  padding-top: 5px;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
