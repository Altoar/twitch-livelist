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
        <div class="stream-list-item__thumbnail-liveduration">
          {{ calculateLiveDuration(props.stream.started_at) }}
        </div>
        <div class="stream-list-item__thumbnail-viewcount">
          {{ formatViewCount(props.stream.viewer_count) }}
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
        <div class="stream-list-item__tags">
          <span
            v-for="tag in props.stream.tags"
            :key="tag"
            class="stream-list-item__tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </BaseLink>
</template>

<script setup lang="ts">
import { type TwitchApiStream } from "@/stores/twitch";
import BaseLink from "@/ui/BaseLink.vue";

const props = defineProps<{
  stream: TwitchApiStream;
}>();

function thumbnail(url: string, width: number, height: number) {
  return url
    .replace("{width}", width.toString())
    .replace("{height}", height.toString());
}

function formatViewCount(count: number) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  } else {
    return count.toString();
  }
}

function calculateLiveDuration(startedAt: string) {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m`;
}
</script>

<style lang="scss" scoped>
.stream-list-item {
  display: flex;
  cursor: pointer;
  padding: 4px 0;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-primary);

  &:hover {
    background-color: var(--background-secondary);
  }

  &__thumbnail {
    aspect-ratio: 16 / 9;
    position: relative;
    flex-shrink: 0;
    width: 130px;
    background: var(--background-secondary);
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--background-secondary) 25%,
      var(--background-primary) 50%,
      var(--background-secondary) 75%
    );
    background-size: 200% 100%;
    animation: skeleton 0.85s ease-in-out infinite;

    @keyframes skeleton {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-viewcount {
      position: absolute;
      font-weight: bold;
      bottom: 0.4rem;
      right: 0.3rem;
      background-color: #000000a1;
      color: #ff4a4a;
      padding: 0.1rem 0.3rem;
      border-radius: 0.3rem;
      font-size: 12px;
    }

    &-liveduration {
      position: absolute;
      font-weight: bold;
      bottom: 0.4rem;
      left: 0.3rem;
      background-color: #000000a1;
      color: var(--text-secondary);
      padding: 0.1rem 0.3rem;
      border-radius: 0.3rem;
      font-size: 12px;
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
  &__tags {
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  &__tag {
    display: inline-block;
    background-color: var(--background-secondary);
    color: var(--text-secondary);
    border-radius: 3px;
    padding: 1px 3px;
    font-size: 11px;
  }
}
</style>
