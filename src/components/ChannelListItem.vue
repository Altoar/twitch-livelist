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
    <div class="channel-list-item__date">
      {{ formatDate(props.channel.followedAt) }}
      <BaseToggle
        v-model="props.channel.notificationsEnabled"
        v-tooltip.bottom-end="
          props.channel.notificationsEnabled
            ? 'Disable Notifications'
            : 'Enable Notifications'
        "
        @update:model-value="toggleNotifications($event as boolean)"
        :disabled="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type FollowedChannel } from "@/stores/twitch";
import BaseLink from "@/ui/BaseLink.vue";
import BaseToggle from "@/ui/BaseToggle.vue";
import { useTwitchStore } from "@/stores/twitch";
import { useMainStore } from "@/stores/main";
const twitchStore = useTwitchStore();
const mainStore = useMainStore();

const props = defineProps<{
  channel: FollowedChannel;
}>();

function toggleNotifications(enabled: boolean) {
  // Placeholder for future implementation
  if (enabled) {
    // Remove the channel id from disabledNotificationChannelIds
    const index = twitchStore.disabledNotificationChannelIds.indexOf(
      props.channel.id
    );
    if (index !== -1) {
      twitchStore.disabledNotificationChannelIds.splice(index, 1);
    }

    mainStore.setStorageItem({
      disabledNotificationChannelIds: twitchStore.disabledNotificationChannelIds
    });
  } else {
    // Add the channel id to disabledNotificationChannelIds
    if (
      !twitchStore.disabledNotificationChannelIds.includes(props.channel.id)
    ) {
      twitchStore.disabledNotificationChannelIds.push(props.channel.id);
    }

    // Store the updated list in mainStore as an array
    mainStore.setStorageItem({
      disabledNotificationChannelIds: [
        ...twitchStore.disabledNotificationChannelIds
      ]
    });
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
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
    gap: 6px;
  }

  &__partner {
    color: var(--color-accent);
  }

  &__date {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 25px;
  }
}
</style>
