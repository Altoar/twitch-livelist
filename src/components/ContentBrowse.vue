<template>
  <div class="content-browse">
    <div class="content-browse__header">
      <div class="content-browse__title">
        <span>{{
          twitchStore.topChannelsCategory?.name || "Top Channels"
        }}</span>
        <BaseButton
          size="sm"
          square
          transparent
          v-tooltip.bottom-end="'All Categories'"
          v-if="twitchStore.topChannelsCategory.id !== 'all'"
          icon="rotate-left"
          @click="twitchStore.resetTopChannelsCategory" />
      </div>
      <div class="content-browse__actions">
        <BaseSelect
          :options="languages"
          v-model="twitchStore.topChannelsLanguage"
          @update:modelValue="selectLanguage" />

        <BaseButton
          size="sm"
          square
          transparent
          icon="arrows-rotate"
          v-tooltip.bottom-end="'Refresh'"
          :loading="twitchStore.fetchTopChannelsStatus === 'loading'"
          @click="
            twitchStore.getTopChannels({
              reset: true,
              language: twitchStore.topChannelsLanguage,
              game: categoryId
            })
          " />
      </div>
    </div>
    <ContentLoading
      v-if="
        twitchStore.fetchTopChannelsStatus === 'loading' &&
        twitchStore.fetchTopChannelsLoadMoreStatus !== 'loading'
      " />
    <template v-else>
      <StreamListItem
        v-for="channel in twitchStore.topChannels"
        :key="channel.id"
        :stream="channel" />

      <div class="content-browse__footer">
        <BaseButton
          size="sm"
          title="Load More"
          primary
          icon="arrows-rotate"
          :loading="twitchStore.fetchTopChannelsLoadMoreStatus === 'loading'"
          @click="
            twitchStore.getTopChannels({
              language: twitchStore.topChannelsLanguage,
              game: categoryId
            })
          " />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import StreamListItem from "./StreamListItem.vue";
import BaseButton from "@/ui/BaseButton.vue";
import BaseSelect from "@/ui/BaseSelect.vue";
import ContentLoading from "./ContentLoading.vue";
import { useMainStore } from "@/stores/main";
const mainStore = useMainStore();

const twitchStore = useTwitchStore();
const categoryId = computed(() => {
  return twitchStore.topChannelsCategory?.id || "all";
});

const languages = ref([
  { label: "All Languages", value: "all" },
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "French", value: "fr" },
  { label: "Japanese", value: "ja" }
]);

function selectLanguage() {
  twitchStore.getTopChannels({
    reset: true,
    language: twitchStore.topChannelsLanguage,
    game: categoryId.value
  });

  mainStore.setStorageItem({
    topChannelsLanguage: twitchStore.topChannelsLanguage
  });
}

onBeforeMount(async () => {
  const topChannelsLanguage = await mainStore.getStorageItem(
    "topChannelsLanguage"
  );

  if (topChannelsLanguage) {
    twitchStore.topChannelsLanguage = topChannelsLanguage;
  }

  twitchStore.getTopChannels({
    reset: true,
    language: twitchStore.topChannelsLanguage as string,
    game: categoryId.value
  });
});
</script>

<style lang="scss" scoped>
.content-browse {
  &__header {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    margin-bottom: 5px;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__actions {
    display: flex;
    gap: 5px;
  }
  &__footer {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
}
</style>
