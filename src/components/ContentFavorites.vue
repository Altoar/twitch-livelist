<template>
  <div class="content-favorites">
    <div class="content-favorites__header">
      <div class="content-favorites__title">
        <span>Favorite Channels</span>
        <span class="content-favorites__count">
          ({{ twitchStore.favoriteLiveChannels.length }} /
          {{ twitchStore.favoriteChannelIds.size }})
        </span>
      </div>
      <div class="content-favorites__actions">
        <BaseButton
          size="sm"
          square
          transparent
          v-tooltip.bottom-end="
            twitchStore.isFavoriteChannelsReverseOrder
              ? 'Sort Descending'
              : 'Sort Ascending'
          "
          :icon="
            twitchStore.isFavoriteChannelsReverseOrder
              ? 'arrow-down-1-9'
              : 'arrow-down-9-1'
          "
          @click="
            twitchStore.reverseFavoriteChannelsOrder(
              !twitchStore.isFavoriteChannelsReverseOrder
            )
          " />
        <BaseButton
          size="sm"
          square
          transparent
          v-tooltip.bottom-end="'Refresh'"
          icon="arrows-rotate"
          :loading="twitchStore.fetchFavoritedLiveChannelsStatus === 'loading'"
          @click="twitchStore.fetchFavoritedLiveChannels()" />
      </div>
    </div>
    <div class="content-favorites__empty" v-if="!hasFavoritedChannels">
      You haven't favorited any channels yet.
    </div>
    <div
      class="content-favorites__error"
      v-else-if="twitchStore.fetchFavoritedLiveChannelsStatus === 'error'">
      An error occurred. Please try again.
    </div>
    <ContentLoading
      v-else-if="twitchStore.fetchFavoritedLiveChannelsStatus === 'loading'" />
    <template v-else-if="twitchStore.favoriteLiveChannels.length === 0">
      None of your favorited channels are currently live.
    </template>
    <template v-else>
      <LiveStreamListItem
        v-for="channel in twitchStore.favoriteLiveChannels"
        :key="channel.id"
        :stream="channel" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import LiveStreamListItem from "./LiveStreamListItem.vue";
import ContentLoading from "./ContentLoading.vue";
import BaseButton from "@/ui/BaseButton.vue";

const twitchStore = useTwitchStore();

const hasFavoritedChannels = computed(
  () => twitchStore.favoriteChannelIds.size > 0
);

onBeforeMount(() => {
  if (hasFavoritedChannels.value) {
    twitchStore.fetchFavoritedLiveChannels();
  }
});
</script>

<style lang="scss" scoped>
.content-favorites {
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

  &__empty,
  &__error {
    text-align: center;
    color: #888;
    margin-top: 2rem;
  }
}
</style>
