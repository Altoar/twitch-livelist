<template>
  <div class="content-categories">
    <InvisibleButton
      v-for="category in twitchStore.topCategories"
      :key="category.id"
      @click="goToCategory(category.id, category.name)">
      <CategoryBox :category="category"
    /></InvisibleButton>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import CategoryBox from "./CategoryBox.vue";
import InvisibleButton from "@/ui/InvisibleButton.vue";

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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}
</style>
