<template>
  <div class="content-follows">
    <div class="content-follows__header">
      <div class="content-follows__title">Your Follows</div>
      <div class="content-follows__actions">
        <BaseButton
          size="sm"
          square
          transparent
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
          icon="arrows-rotate"
          :loading="twitchStore.fetchFollowedChannelsStatus === 'loading'"
          @click="twitchStore.getFollowedChannels()" />
      </div>
    </div>
    <StreamListItem
      v-for="channel in twitchStore.followedChannels"
      :key="channel.id"
      :stream="channel" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import BaseButton from "@/ui/BaseButton.vue";
import StreamListItem from "./StreamListItem.vue";

const twitchStore = useTwitchStore();

onBeforeMount(() => {
  twitchStore.getFollowedChannels();
});
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
}
</style>
