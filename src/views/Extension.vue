<template>
  <TopBar />
  <div class="main-content">
    <SideNav />
    <div class="content-area">
      <component :is="currentView" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import TopBar from "../components/TopBar.vue";
import SideNav from "../components/SideNav.vue";
import ContentFollows from "@/components/ContentFollows.vue";
import ContentBrowse from "@/components/ContentBrowse.vue";

const routes = {
  "/follows": ContentFollows,
  "/browse": ContentBrowse
};

const currentPath = ref(window.location.hash);

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
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
  min-width: 420px;
  max-width: 400px;
  max-height: 500px;
}
.content-area {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
}
</style>
