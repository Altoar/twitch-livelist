<template>
  <div class="content-follows">
    <div class="content-follows__header">
      <div class="content-follows__title">Live Followed</div>
      <div class="content-follows__actions">
        <BaseButton
          size="sm"
          square
          transparent
          v-tooltip.bottom-end="
            twitchStore.isFollowedChannelsReverseOrder
              ? 'Sort Descending'
              : 'Sort Ascending'
          "
          :icon="
            twitchStore.isFollowedChannelsReverseOrder
              ? 'arrow-down-1-9'
              : 'arrow-down-9-1'
          "
          @click="
            twitchStore.reverseFollowedChannelsOrder(
              !twitchStore.isFollowedChannelsReverseOrder
            )
          " />
        <BaseButton
          size="sm"
          square
          transparent
          v-tooltip.bottom-end="'Refresh'"
          icon="arrows-rotate"
          :loading="twitchStore.fetchFollowedChannelsStatus === 'loading'"
          @click="twitchStore.fetchFollowedLiveChannels()" />
      </div>
    </div>
    <div
      class="content-follows__empty"
      v-if="
        !twitchStore.followedLiveChannels.length &&
        twitchStore.fetchFollowedChannelsStatus === 'success'
      ">
      No followed channels are live right now.
    </div>
    <div
      class="content-follows__empty"
      v-else-if="twitchStore.fetchFollowedChannelsStatus === 'error'">
      An error occurred. Please try again.
    </div>
    <ContentLoading
      v-else-if="twitchStore.fetchFollowedChannelsStatus === 'loading'" />
    <template v-else>
      <LiveStreamListItem
        v-for="channel in twitchStore.followedLiveChannels"
        :key="channel.id"
        :stream="channel" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTwitchStore } from "@/stores/twitch";
import BaseButton from "@/ui/BaseButton.vue";
import LiveStreamListItem from "./LiveStreamListItem.vue";
import ContentLoading from "./ContentLoading.vue";

const twitchStore = useTwitchStore();
</script>

<style lang="scss" scoped>
.content-follows {
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

  &__empty {
    padding: 20px;
    text-align: center;
    color: var(--text-secondary);
  }
}
</style>
