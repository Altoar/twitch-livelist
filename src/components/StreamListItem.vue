<template>
  <BaseLink
    :href="`https://www.twitch.tv/${props.stream.user_login}`"
    :title="props.stream.title"
    target="_blank">
    <div class="stream-list-item">
      <div class="stream-list-item__thumbnail">
        <img
          :src="thumbnail(props.stream.thumbnail_url, 160, 90)"
          alt="Stream Thumbnail"
          class="" />
        <div class="stream-list-item__thumbnail-viewcount">
          {{ props.stream.viewer_count }}
        </div>
      </div>
      <div class="stream-list-item__info">
        <div class="stream-list-item__channel-name">
          {{ props.stream.user_name }}
        </div>
        <div class="stream-list-item__title">{{ props.stream.title }}</div>
        <div class="stream-list-item__category">
          {{ props.stream.game_name }}
        </div>
      </div>
    </div>
  </BaseLink>
</template>

<script setup lang="ts">
import { type TwitchApiFollowedChannel } from "@/stores/twitch";
import BaseLink from "@/ui/BaseLink.vue";

const props = defineProps<{
  stream: TwitchApiFollowedChannel;
}>();

function thumbnail(url: string, width: number, height: number) {
  return url
    .replace("{width}", width.toString())
    .replace("{height}", height.toString());
}
</script>

<style lang="scss" scoped>
.stream-list-item {
  display: flex;
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 1px solid var(--border-primary);

  &:hover {
    background-color: var(--background-secondary);
  }

  &__thumbnail {
    aspect-ratio: 16 / 9;
    position: relative;
    flex-shrink: 0;
    width: 120px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-viewcount {
      position: absolute;
      bottom: 0.5rem;
      right: 0.3rem;
      background-color: #000000a1;
      color: #ff4a4a;
      padding: 0.1rem 0.3rem;
      border-radius: 0.3rem;
      font-size: 0.8rem;
    }
  }

  &__info {
    margin-left: 6px;
    max-width: 260px;
    overflow: hidden;
  }

  &__title {
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__channel-name {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: bold;
  }
  &__category {
    color: var(--text-secondary);
    font-size: 14px;
  }
}
</style>
