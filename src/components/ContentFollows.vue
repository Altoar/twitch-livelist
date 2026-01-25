<template>
  <div class="content-follows">
    <div class="content-follows__header">
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
    <StreamListItem
      v-for="channel in twitchStore.followedChannels"
      :key="channel.id"
      :stream="channel" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from "vue";
import { useMainStore } from "@/stores/main";
import { useTwitchStore } from "@/stores/twitch";
import BaseButton from "@/ui/BaseButton.vue";
import StreamListItem from "./StreamListItem.vue";

const mainStore = useMainStore();
const twitchStore = useTwitchStore();

onBeforeMount(() => {
  twitchStore.getFollowedChannels();
});
</script>

<style lang="scss" scoped>
.content-follows {
  &__header {
    display: flex;
    justify-content: flex-end;
    padding: 0 10px;
    margin-bottom: 5px;
  }
}
</style>
