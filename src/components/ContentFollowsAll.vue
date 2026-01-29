<template>
  <div class="content-follows-all">
    <ContentLoading
      v-if="twitchStore.fetchFollowedChannelsStatus === 'loading'" />
    <template v-else>
      <div class="content-follows__header">
        All Followed Channels ({{ twitchStore.followedChannels.length }})
      </div>
      <ChannelListItem
        v-for="channel in twitchStore.followedChannels"
        :key="channel.id"
        :channel="channel" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import ChannelListItem from "./ChannelListItem.vue";
import ContentLoading from "./ContentLoading.vue";

const twitchStore = useTwitchStore();

onBeforeMount(() => {
  twitchStore.getFollowedChannels();
});
</script>

<style lang="scss" scoped>
.content-follows-all {
  .content-follows__header {
    font-weight: bold;

    margin-bottom: 5px;
    padding-left: 5px;
  }
}
</style>
