import { ref } from "vue";
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

export interface TwitchApiCategory {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id?: string;
}

export interface TwitchApiResponse {
  total?: number;
  data: TwitchApiStream[] | TwitchApiCategory[];
  pagination: {
    cursor?: string;
  };
}

export interface TwitchApiFollowedChannelsResponse {
  total?: number;
  data: TwitchApiFollowedChannel[];
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

export interface TwitchApiFollowedChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}

export interface FollowedChannel {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  followedAt: string;
  broadcasterType: string;
  notificationsEnabled: boolean;
}

type FetchStatus = "idle" | "loading" | "error" | "success";

export const useTwitchStore = defineStore("twitch", () => {
  const mainStore = useMainStore();
  const followedLiveChannels = ref<TwitchApiStream[]>([]);
  const followedChannels = ref<FollowedChannel[]>([]);
  const disabledNotificationChannelIds = ref<string[]>([]);
  const isFollowedChannelsReverseOrder = ref(false);
  const topChannels = ref<TwitchApiStream[]>([]);
  const topChannelsCursor = ref<string | undefined>(undefined);
  const topChannelsLanguage = ref<string>("all");
  const topChannelsCategory = ref({
    id: "all",
    name: "Top Channels"
  });
  const topCategories = ref<TwitchApiCategory[]>([]);
  const fetchFollowedChannelsStatus = ref<FetchStatus>("idle");
  const fetchTopChannelsStatus = ref<FetchStatus>("idle");
  const fetchTopChannelsLoadMoreStatus = ref<FetchStatus>("idle");
  const fetchTopCategoriesStatus = ref<FetchStatus>("idle");

  async function validateToken(): Promise<boolean> {
    const mainStore = useMainStore();
    try {
      const response = await axios.get("https://id.twitch.tv/oauth2/validate", {
        headers: {
          Authorization: "OAuth " + mainStore.twitchAccessToken
        }
      });

      mainStore.twitchData = {
        ...mainStore.twitchData,
        clientId: response.data.client_id,
        expiresIn: response.data.expires_in,
        scopes: response.data.scopes
      };
      mainStore.setStorageItem({ twitchData: mainStore.twitchData });
      return true;
    } catch (error) {
      mainStore.logoutTwitch();
      console.error("Token validation failed:", error);
      return false;
    }
  }

  async function getTwitchUser() {
    const mainStore = useMainStore();
    try {
      console.log("Fetching Twitch user info...", mainStore.twitchAccessToken);
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
        console.log("Fetched Twitch user info:", mainStore.twitchData.user);
      }
    } catch (error) {
      console.error("Error fetching Twitch user info:", error);
    }
  }

  function reverseFollowedChannelsOrder(reverse: boolean) {
    isFollowedChannelsReverseOrder.value = reverse;

    followedLiveChannels.value = followedLiveChannels.value.reverse();

    mainStore.setStorageItem({
      isFollowedChannelsReverseOrder: isFollowedChannelsReverseOrder.value
    });
  }

  async function getFollowedLiveChannels() {
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
        const response: TwitchApiResponse = await callApi<TwitchApiResponse>(
          "/streams/followed",
          "GET",
          {
            params: {
              user_id: mainStore.twitchData?.user?.id,
              first: 100,
              after: cursor
            }
          }
        );

        allChannels.push(...(response.data as TwitchApiStream[]));
        cursor = response.pagination.cursor;
      } catch (error) {
        console.error("Error fetching followed channels:", error);
        fetchFollowedChannelsStatus.value = "error";
        return;
      }
    } while (cursor);

    fetchFollowedChannelsStatus.value = "success";

    followedLiveChannels.value = isFollowedChannelsReverseOrder.value
      ? allChannels.reverse()
      : allChannels;
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

    const allChannels: FollowedChannel[] = [];
    let cursorFollowedChannels: string | undefined = undefined;

    do {
      fetchFollowedChannelsStatus.value = "loading";

      try {
        const responseFollowedChannels: TwitchApiFollowedChannelsResponse =
          await callApi<TwitchApiFollowedChannelsResponse>(
            "/channels/followed",
            "GET",
            {
              params: {
                user_id: mainStore.twitchData?.user?.id,
                first: 100,
                after: cursorFollowedChannels
              }
            }
          );

        // Get profile pictures for each followed channel
        const channelIds = responseFollowedChannels.data.map(
          (channel) => channel.broadcaster_id
        );
        const userResponse = await callApi<{ data: TwitchUserApiResponse[] }>(
          "/users",
          "GET",
          {
            params: {
              id: channelIds
            }
          }
        );

        const userMap: Record<string, TwitchUserApiResponse> = {};
        userResponse.data.forEach((user) => {
          userMap[user.id] = user;
        });

        allChannels.push(
          ...responseFollowedChannels.data.map((channel) => ({
            id: channel.broadcaster_id,
            login: channel.broadcaster_login,
            displayName: channel.broadcaster_name,
            profileImageUrl:
              userMap[channel.broadcaster_id]?.profile_image_url || "",
            broadcasterType:
              userMap[channel.broadcaster_id]?.broadcaster_type || "",
            followedAt: channel.followed_at,
            notificationsEnabled:
              !disabledNotificationChannelIds.value.includes(
                channel.broadcaster_id
              )
          }))
        );

        cursorFollowedChannels = responseFollowedChannels.pagination.cursor;
      } catch (error) {
        console.error("Error fetching followed channels:", error);
        fetchFollowedChannelsStatus.value = "error";
        return;
      }
    } while (cursorFollowedChannels);

    fetchFollowedChannelsStatus.value = "success";
    followedChannels.value = allChannels;
  }

  async function getTopChannels({
    language = "all",
    game = "all",
    reset = false
  }) {
    if (
      fetchTopChannelsStatus.value === "loading" ||
      fetchTopChannelsLoadMoreStatus.value === "loading"
    ) {
      return;
    }

    if (reset) {
      topChannelsCursor.value = undefined;
      fetchTopChannelsStatus.value = "loading";
    } else {
      fetchTopChannelsLoadMoreStatus.value = "loading";
    }

    try {
      const response = await callApi<TwitchApiResponse>("/streams", "GET", {
        params: {
          first: 30,
          after: topChannelsCursor.value,
          game_id: game === "all" ? undefined : game,
          language: language === "all" ? undefined : language
        }
      });
      if (reset) {
        topChannels.value = response.data as TwitchApiStream[];
      } else {
        topChannels.value.push(...(response.data as TwitchApiStream[]));
      }
      topChannelsCursor.value = response.pagination.cursor;
      fetchTopChannelsStatus.value = "success";
      fetchTopChannelsLoadMoreStatus.value = "success";
    } catch (error) {
      fetchTopChannelsStatus.value = "error";
      fetchTopChannelsLoadMoreStatus.value = "error";
      console.error("Error fetching top channels:", error);
    }
  }

  function resetTopChannelsCategory() {
    topChannelsCategory.value = {
      id: "all",
      name: "Top Channels"
    };

    topChannelsCursor.value = undefined;

    getTopChannels({
      game: "all",
      language: topChannelsLanguage.value,
      reset: true
    });
  }

  async function getTopCategories() {
    if (fetchTopChannelsStatus.value === "loading") {
      return;
    }

    try {
      fetchTopCategoriesStatus.value = "loading";
      const response = await callApi<TwitchApiResponse>("/games/top", "GET", {
        params: {
          first: 100
        }
      });
      fetchTopCategoriesStatus.value = "success";
      topCategories.value = response.data as TwitchApiCategory[];
    } catch (error) {
      fetchTopCategoriesStatus.value = "error";
      console.error("Error fetching top categories:", error);
    }
  }

  return {
    topChannels,
    followedLiveChannels,
    fetchFollowedChannelsStatus,
    fetchTopChannelsStatus,
    topChannelsLanguage,
    isFollowedChannelsReverseOrder,
    topCategories,
    topChannelsCategory,
    fetchTopChannelsLoadMoreStatus,
    followedChannels,
    fetchTopCategoriesStatus,
    disabledNotificationChannelIds,
    validateToken,
    getTopChannels,
    getFollowedLiveChannels,
    getTwitchUser,
    reverseFollowedChannelsOrder,
    getTopCategories,
    resetTopChannelsCategory,
    getFollowedChannels
  };
});
