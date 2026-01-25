<template>
  <div
    class="category-box"
    :style="{ backgroundImage: 'url(' + getBoxArtUrl + ')' }"></div>
</template>
<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  category: {
    id: string;
    name: string;
    box_art_url: string;
  };
}>();

const getBoxArtUrl = computed(() => {
  return props.category.box_art_url
    .replace("{width}", "150")
    .replace("{height}", "200");
});
</script>

<style scoped lang="scss">
.category-box {
  width: 120px;
  height: 150px;
  border-radius: 8px;
  background-color: var(--background-secondary);
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
