<template>
  <div class="content-channels-management">
    <BaseTabNav v-model:activeTab="activeTab" :tabs="tabs" />

    <template v-if="activeTab === 'followed'">
      <div class="content-channels-management__header">
        All Followed Channels ({{ twitchStore.followedChannels.length }})
      </div>
      <ContentLoading
        v-if="twitchStore.fetchFollowedChannelsStatus === 'loading'" />
      <div
        class="content-channels-management__error"
        v-else-if="twitchStore.fetchFollowedChannelsStatus === 'error'">
        An error occurred. Please try again.
      </div>
      <tempalte v-else>
        <ChannelListItem
          v-for="channel in twitchStore.followedChannels"
          type="followed"
          :key="channel.id"
          :channel="channel"
      /></tempalte>
    </template>
    <template v-else-if="activeTab === 'favorited'">
      <div class="content-channels-management__header">
        Favorited Channels ({{ twitchStore.favoriteChannelIds.size }}/100)
      </div>
      <ContentLoading
        v-if="twitchStore.fetchFavoriteChannelsStatus === 'loading'" />
      <div
        class="content-channels-management__error"
        v-else-if="twitchStore.fetchFavoriteChannelsStatus === 'error'">
        An error occurred. Please try again.
      </div>
      <ChannelListItem
        v-for="channel in twitchStore.favoriteChannels"
        type="favorited"
        :key="channel.id"
        :channel="channel" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, watch } from "vue";
import { useTwitchStore } from "@/stores/twitch";
import ChannelListItem from "./ChannelListItem.vue";
import ContentLoading from "./ContentLoading.vue";
import BaseTabNav from "@/ui/BaseTabNav.vue";
import { ref } from "vue";

const twitchStore = useTwitchStore();

const activeTab = ref("followed");
const tabs = [
  { name: "followed", label: "Followed" },
  { name: "favorited", label: "Favorited" }
];

onBeforeMount(() => {
  twitchStore.fetchFollowedChannels();
});

watch(activeTab, (newTab) => {
  if (newTab === "favorited") {
    twitchStore.fetchFavoriteChannels();
  }
});
</script>

<style lang="scss" scoped>
.content-channels-management {
  &__header {
    margin-bottom: 5px;
    padding-left: 5px;
    text-align: center;
    font-size: 12px;
    margin-top: 10px;
    color: var(--text-secondary);
  }
  &__error {
    padding: 20px;
    text-align: center;
    color: var(--text-secondary);
  }
}
</style>
