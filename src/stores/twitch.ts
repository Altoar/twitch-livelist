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
  const fetchFavoriteChannelsStatus = ref<FetchStatus>("idle");
  const twitchAuthStatus = ref<"idle" | "loading" | "error" | "success">(
    "idle"
  );

  const favoriteChannelIds = ref<Set<string>>(new Set());
  const favoriteLiveChannels = ref<TwitchApiStream[]>([]);
  const favoriteChannels = ref<FollowedChannel[]>([]);
  const isFavoriteChannelsReverseOrder = ref(false);
  const favoritedLiveChannelsCountForNavBadge = ref(0);

  async function validateToken(): Promise<boolean> {
    const mainStore = useMainStore();

    twitchAuthStatus.value = "loading";

    const twitchData = await mainStore.getStorageItem("twitchData");

    try {
      const response = await axios.get("https://id.twitch.tv/oauth2/validate", {
        headers: {
          Authorization: "OAuth " + mainStore.twitchAccessToken
        }
      });

      mainStore.twitchData = {
        ...twitchData,
        clientId: response.data.client_id,
        expiresIn: response.data.expires_in,
        scopes: response.data.scopes
      };
      mainStore.setStorageItem({ twitchData: mainStore.twitchData });
      twitchAuthStatus.value = "success";
      return true;
    } catch (error) {
      mainStore.logoutTwitch();
      console.error("Token validation failed:", error);
      twitchAuthStatus.value = "error";
      return false;
    }
  }

  async function getTwitchUser() {
    const mainStore = useMainStore();
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

    followedLiveChannels.value = followedLiveChannels.value.reverse();

    mainStore.setStorageItem({
      isFollowedChannelsReverseOrder: isFollowedChannelsReverseOrder.value
    });
  }

  async function fetchFollowedLiveChannels() {
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

  async function fetchFollowedChannels() {
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

        followedChannels.value.push(
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

  async function addChannelToFavorites(channelId: string) {
    if (favoriteChannelIds.value.size >= 100) {
      console.warn("Maximum of 100 favorite channels reached");
      return;
    }

    favoriteChannelIds.value.add(channelId);

    favoritedLiveChannelsCountForNavBadge.value++;

    mainStore.setStorageItem({
      favoriteChannelIds: Array.from(favoriteChannelIds.value)
    });
  }

  async function removeChannelFromFavorites(channelId: string) {
    favoriteChannelIds.value.delete(channelId);

    const isChannelCurrentlyLive = favoriteLiveChannels.value.some(
      (channel) => channel.user_id === channelId
    );

    if (isChannelCurrentlyLive) {
      // Remove the channel from the favoriteLiveChannels list if it's there
      favoriteLiveChannels.value = favoriteLiveChannels.value.filter(
        (channel) => channel.user_id !== channelId
      );
      favoritedLiveChannelsCountForNavBadge.value--;
    }

    mainStore.setStorageItem({
      favoriteChannelIds: Array.from(favoriteChannelIds.value)
    });
  }

  async function fetchFavoritedLiveChannels() {
    if (
      favoriteChannelIds.value.size === 0 ||
      favoriteChannelIds.value.size > 100
    ) {
      return;
    }

    try {
      fetchFavoriteChannelsStatus.value = "loading";

      const channelIds = Array.from(favoriteChannelIds.value);
      const params = new URLSearchParams();
      channelIds.forEach((id) => params.append("user_id", id));
      params.append("first", "100");

      const response = await callApi<{ data: TwitchApiStream[] }>(
        "/streams",
        "GET",
        {
          params: params
        }
      );

      favoriteLiveChannels.value = isFavoriteChannelsReverseOrder.value
        ? response.data.reverse()
        : response.data;

      fetchFavoriteChannelsStatus.value = "success";

      favoritedLiveChannelsCountForNavBadge.value = response.data.length;

      return response.data;
    } catch (error) {
      fetchFavoriteChannelsStatus.value = "error";
      console.error("Error fetching favorited channels:", error);
      return [];
    }
  }

  function reverseFavoriteChannelsOrder(reverse: boolean) {
    isFavoriteChannelsReverseOrder.value = reverse;
    favoriteLiveChannels.value = favoriteLiveChannels.value.reverse();

    mainStore.setStorageItem({
      isFavoriteChannelsReverseOrder: isFavoriteChannelsReverseOrder.value
    });
  }

  function fetchFavoriteChannels() {
    if (favoriteChannelIds.value.size === 0) {
      favoriteChannels.value = [];
      return;
    }

    const allChannels: FollowedChannel[] = [];
    const channelIds = Array.from(favoriteChannelIds.value);
    const userResponse = callApi<{ data: TwitchUserApiResponse[] }>(
      "/users",
      "GET",
      {
        params: {
          id: channelIds
        }
      }
    );

    userResponse.then((response) => {
      const userMap: Record<string, TwitchUserApiResponse> = {};
      response.data.forEach((user) => {
        userMap[user.id] = user;
      });

      allChannels.push(
        ...response.data.map((user) => ({
          id: user.id,
          login: user.login,
          displayName: user.display_name,
          profileImageUrl: user.profile_image_url,
          broadcasterType: user.broadcaster_type,
          followedAt: "", // No followedAt for favorited channels
          notificationsEnabled: !disabledNotificationChannelIds.value.includes(
            user.id
          )
        }))
      );
      favoriteChannels.value = allChannels;
    });
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
    favoriteChannelIds,
    favoriteLiveChannels,
    fetchFavoriteChannelsStatus,
    isFavoriteChannelsReverseOrder,
    favoriteChannels,
    twitchAuthStatus,
    favoritedLiveChannelsCountForNavBadge,
    validateToken,
    getTopChannels,
    fetchFollowedLiveChannels,
    getTwitchUser,
    reverseFollowedChannelsOrder,
    getTopCategories,
    resetTopChannelsCategory,
    fetchFollowedChannels,
    addChannelToFavorites,
    removeChannelFromFavorites,
    fetchFavoritedLiveChannels,
    reverseFavoriteChannelsOrder,
    fetchFavoriteChannels
  };
});
