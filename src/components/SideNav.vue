<template>
  <div class="sidenav">
    <div class="sidenav__navigation">
      <a
        :href="item.link"
        class="sidenav__nav-item"
        :title="item.name"
        :class="{
          'sidenav__nav-item--active': props.currentPath === item.link
        }"
        v-for="item in nav"
        :key="item.name"
        ><Icon :icon="item.icon" size="lg"
      /></a>
    </div>
    <div class="sidenav__bottomnav">
      <a
        href="#"
        class="sidenav__nav-item"
        v-if="mainStore.isLoggedIn"
        @click.prevent="mainStore.logoutTwitch()"
        ><Icon :icon="'arrow-right-from-bracket'" size="lg" :title="'Logout'" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMainStore } from "@/stores/main";
const mainStore = useMainStore();

const props = defineProps<{
  currentPath: string;
}>();
const nav = ref([
  { name: "Follows", icon: "heart", link: "#/follows" },
  { name: "Browse", icon: "compass", link: "#/browse" }
]);
</script>

<style scoped lang="scss">
.sidenav {
  width: 40px;
  border-right: 1px solid var(--border-primary);
  height: 100%;
  display: flex;
  flex-direction: column;

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

    &:hover,
    &--active {
      background-color: var(--background-secondary);
      color: var(--accent-color);
    }
  }
}
</style>
