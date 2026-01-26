<template>
  <div class="channel-list-item">
    <div class="channel-list-item__info">
      <div class="channel-list-item__avatar">
        <img
          :src="props.channel.profileImageUrl"
          :alt="`${props.channel.displayName} Avatar`" />
      </div>
      <div class="channel-list-item__name">
        <BaseLink
          :href="`https://www.twitch.tv/${props.channel.login}`"
          type="text"
          >{{ props.channel.displayName }}</BaseLink
        >
        <span
          class="channel-list-item__partner"
          title="Twitch Partner"
          v-if="props.channel.broadcasterType === 'partner'">
          <Icon icon="circle-check" size="xs" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type FollowedChannel } from "@/stores/twitch";
import BaseLink from "@/ui/BaseLink.vue";
const props = defineProps<{
  channel: FollowedChannel;
}>();
</script>

<style lang="scss" scoped>
.channel-list-item {
  display: flex;
  padding: 4px 10px;
  border-bottom: 1px solid var(--border-primary);

  &__info {
    display: flex;
    align-items: center;
  }

  &__avatar {
    width: 32px;
    height: 32px;
    margin-right: 10px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__partner {
    color: var(--color-accent);
  }
}
</style>
