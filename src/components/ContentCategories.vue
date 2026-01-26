<template>
  <ContentLoading v-if="twitchStore.fetchTopCategoriesStatus === 'loading'" />
  <div v-else-if="twitchStore.fetchTopCategoriesStatus === 'error'">
    Error loading categories.
  </div>
  <template v-else>
    <div class="content-categories">
      <InvisibleButton
        v-for="category in twitchStore.topCategories"
        v-tooltip.bottom="category.name"
        :key="category.id"
        @click="goToCategory(category.id, category.name)">
        <CategoryBox :category="category"
      /></InvisibleButton></div
  ></template>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import CategoryBox from "./CategoryBox.vue";
import InvisibleButton from "@/ui/InvisibleButton.vue";
import ContentLoading from "./ContentLoading.vue";

const twitchStore = useTwitchStore();

onBeforeMount(() => {
  twitchStore.getTopCategories();
});

function goToCategory(categoryId: string, name: string) {
  twitchStore.topChannelsCategory = {
    id: categoryId,
    name: name
  };
  window.location.hash = `#/browse`;
}
</script>

<style lang="scss" scoped>
.content-categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
}
</style>
