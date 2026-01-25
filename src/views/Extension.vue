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
import ContentFollows from "@/components/ContentFollows.vue";
import ContentBrowse from "@/components/ContentBrowse.vue";
import ContentCategories from "@/components/ContentCategories.vue";
import ContentNotLoggedIn from "@/components/ContentNotLoggedIn.vue";
import { useMainStore } from "@/stores/main";
const mainStore = useMainStore();

const routes = {
  "/follows": ContentFollows,
  "/browse": ContentBrowse,
  "/categories": ContentCategories
};

const currentPath = ref(window.location.hash);

// Clean query parameters from initial path
currentPath.value = currentPath.value.split("?")[0] || "#/follows";

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash.split("?")[0] || "#/follows";
});

const currentView = computed(() => {
  const path = currentPath.value.slice(1) || "/follows";
  return routes[path as keyof typeof routes] || routes["/follows"];
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
