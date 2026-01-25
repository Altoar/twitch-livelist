import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useApi } from "@/composables/useTwitchApi";
import { useMainStore } from "./main";
import axios from "axios";

const callApi = useApi();

export interface TwitchApiStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  tags: string[];
  is_mature: boolean;
}

export interface TwitchApiStreamsResponse {
  data: TwitchApiStream[];
  pagination: {
    cursor?: string;
  };
}

export interface TwitchUserApiResponse {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export const useTwitchStore = defineStore("twitch", () => {
  const mainStore = useMainStore();
  const followedChannels = ref<TwitchApiStream[]>([]);
  const isFollowedChannelsReverseOrder = ref(false);
  const topChannels = ref<TwitchApiStream[]>([]);
  const topChannelsCursor = ref<string | undefined>(undefined);
  const topChannelsLanguage = ref<string>("all");
  const fetchFollowedChannelsStatus = ref<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const fetchTopChannelsStatus = ref<"idle" | "loading" | "error" | "success">(
    "idle"
  );

  async function validateToken(): Promise<boolean> {
    const mainStore = useMainStore();
    try {
      const response = await axios.get("https://id.twitch.tv/oauth2/validate", {
        headers: {
          Authorization: "OAuth " + mainStore.twitchAccessToken
        }
      });

      mainStore.twitchData = {
        clientId: response.data.client_id,
        expiresIn: response.data.expires_in,
        scopes: response.data.scopes
      };
      mainStore.setStorageItem({ twitchData: mainStore.twitchData });
      return true;
    } catch (error) {
      mainStore.twitchData = null;
      mainStore.twitchAccessToken = "";
      console.error("Token validation failed:", error);
      return false;
    }
  }

  async function getTwitchUser() {
    try {
      const user = await callApi<{ data: TwitchUserApiResponse[] }>(
        "/users",
        "GET"
      );

      if (!user.data[0] || user.data.length === 0) {
        console.error("No user data returned from Twitch API");
        return;
      }

      if (mainStore.twitchData) {
        mainStore.twitchData.user = {
          id: user.data[0].id,
          login: user.data[0].login,
          displayName: user.data[0].display_name,
          type: user.data[0].type,
          broadcasterType: user.data[0].broadcaster_type,
          description: user.data[0].description,
          profileImageUrl: user.data[0].profile_image_url,
          offlineImageUrl: user.data[0].offline_image_url,
          email: user.data[0].email,
          createdAt: user.data[0].created_at
        };

        mainStore.setStorageItem({ twitchData: mainStore.twitchData });
      }
    } catch (error) {
      console.error("Error fetching Twitch user info:", error);
    }
  }

  function reverseFollowedChannelsOrder(reverse: boolean) {
    isFollowedChannelsReverseOrder.value = reverse;

    followedChannels.value = followedChannels.value.reverse();

    mainStore.setStorageItem({
      isFollowedChannelsReverseOrder: isFollowedChannelsReverseOrder.value
    });
  }

  async function getFollowedChannels() {
    if (!mainStore.isLoggedIn) {
      console.warn(
        "User is not logged in to Twitch, cannot fetch followed channels"
      );
      return;
    }

    if (fetchFollowedChannelsStatus.value === "loading") {
      return;
    }

    const allChannels: TwitchApiStream[] = [];
    let cursor: string | undefined = undefined;

    do {
      fetchFollowedChannelsStatus.value = "loading";

      try {
        const response: TwitchApiStreamsResponse =
          await callApi<TwitchApiStreamsResponse>("/streams/followed", "GET", {
            params: {
              user_id: mainStore.twitchData?.user?.id,
              first: 100,
              after: cursor
            }
          });

        allChannels.push(...response.data);
        cursor = response.pagination.cursor;
      } catch (error) {
        console.error("Error fetching followed channels:", error);
        fetchFollowedChannelsStatus.value = "error";
        return;
      }
    } while (cursor);

    fetchFollowedChannelsStatus.value = "success";

    followedChannels.value = isFollowedChannelsReverseOrder.value
      ? allChannels.reverse()
      : allChannels;
  }

  async function getTopChannels({
    language = "all",
    game = undefined,
    reset = false
  }) {
    if (fetchTopChannelsStatus.value === "loading") {
      return;
    }

    if (reset) {
      topChannelsCursor.value = undefined;
    }
    fetchTopChannelsStatus.value = "loading";

    try {
      const response = await callApi<TwitchApiStreamsResponse>(
        "/streams",
        "GET",
        {
          params: {
            first: 30,
            after: topChannelsCursor.value,
            game_id: game,
            language: language === "all" ? undefined : language
          }
        }
      );
      if (reset) {
        topChannels.value = response.data;
      } else {
        topChannels.value.push(...response.data);
      }
      topChannelsCursor.value = response.pagination.cursor;
      fetchTopChannelsStatus.value = "success";
    } catch (error) {
      fetchTopChannelsStatus.value = "error";
      console.error("Error fetching top channels:", error);
    }
  }

  return {
    topChannels,
    followedChannels,
    fetchFollowedChannelsStatus,
    fetchTopChannelsStatus,
    topChannelsLanguage,
    isFollowedChannelsReverseOrder,
    validateToken,
    getTopChannels,
    getFollowedChannels,
    getTwitchUser,
    reverseFollowedChannelsOrder
  };
});
