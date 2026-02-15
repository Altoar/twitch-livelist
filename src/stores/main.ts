import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useTwitchStore } from "./twitch";

interface ChromeMessage {
  type: "SET_TWITCH_ACCESSTOKEN";
  data: { token: string };
}

export interface TwitchData {
  clientId: string;
  expiresIn: number;
  scopes: string[];
  user?: TwitchUser;
}

export interface TwitchUser {
  id: string;
  login: string;
  displayName: string;
  type: string;
  broadcasterType: string;
  description: string;
  profileImageUrl: string;
  offlineImageUrl: string;
  email?: string;
  createdAt: string;
}

export const useMainStore = defineStore("main", () => {
  const twitchAccessToken = ref("");

  const twitchData = ref<TwitchData | null>(null);

  const isDesktopNotificationsEnabled = ref<boolean>(true);
  const isNotificationSilent = ref<boolean>(true);
  const defaultPage = ref<"#/followed-live" | "#/favorites">("#/followed-live");
  const badgeLiveChannelsNumberType = ref<
    "followed-only" | "favorited-only" | "followed-and-favorited"
  >("followed-only");

  const twitchAuthStatus = ref<"idle" | "loading" | "error" | "success">(
    "idle"
  );

  const notificationChannelsType = ref<
    "followed-only" | "favorited-only" | "followed-and-favorited"
  >("followed-only");

  const isLoggedIn = computed(
    () => twitchData.value !== null && twitchData.value.user?.id
  );

  const authLink = computed(() => {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_AUTH_URL;
    const scope = ["user:read:email", "user:read:follows"].join("+");
    return `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  });

  async function authenticateTwitch(token: string) {
    if (!token || token.trim() === "") {
      console.error("Empty Twitch access token provided");
      return;
    }

    twitchAccessToken.value = token;
    twitchAuthStatus.value = "loading";

    const twitchStore = useTwitchStore();

    // Send access token to service worker where it will be stored in chrome storage
    sendChromeMessage({
      type: "SET_TWITCH_ACCESSTOKEN",
      data: { token: token }
    });

    // For web app version only. Not for Chrome extension
    const isValid = await twitchStore.validateToken();
    if (!isValid) {
      console.error("Invalid Twitch access token");
      twitchAuthStatus.value = "error";
    } else {
      console.log("Twitch access token is valid");
      await setStorageItem({ twitchAccessToken: token });
      await twitchStore.getTwitchUser();
      twitchAuthStatus.value = "success";
    }
  }

  function logoutTwitch() {
    twitchAccessToken.value = "";
    twitchData.value = null;

    // Clear access token from chrome storage
    setStorageItem({ twitchAccessToken: "" });
    setStorageItem({ twitchData: null });
  }

  function sendChromeMessage(message: ChromeMessage) {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage(import.meta.env.VITE_CHROME_EXTENSION_ID, {
        type: message.type,
        data: message.data
      });
    } else {
      console.warn(
        "Not running in a Chrome extension environment. Could not send message."
      );
    }
  }

  async function setStorageItem(data: { [key: string]: any }): Promise<void> {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.sync.set(data);
      return Promise.resolve();
    } else if (typeof localStorage !== "undefined") {
      const key = Object.keys(data)[0] as string;
      const value = Object.values(data)[0];
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
      return Promise.resolve();
    } else {
      console.warn(
        "Neither chrome.storage nor localStorage is available. Could not set storage item."
      );
      return Promise.reject(
        "Neither chrome.storage nor localStorage is available. Could not set storage item."
      );
    }
  }

  async function getStorageItem(key: string): Promise<any> {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.sync.get(key);
      return result[key];
    } else if (typeof localStorage !== "undefined") {
      const item = localStorage.getItem(key);
      try {
        return item ? JSON.parse(item) : null;
      } catch {
        return item;
      }
    } else {
      throw new Error(
        "Neither chrome.storage nor localStorage is available. Could not get from storage."
      );
    }
  }

  function toggleDesktopNotifications(status: boolean) {
    setStorageItem({ desktopNotifications: status });
  }

  function toggleSilentNotifications(status: boolean) {
    setStorageItem({ silentNotifications: status });
  }

  function setTwitchData(data: TwitchData | null) {
    twitchData.value = data;
  }

  function setDefaultPage(page: "#/followed-live" | "#/favorites") {
    defaultPage.value = page;
    setStorageItem({ defaultPage: page });
  }

  function setbadgeLiveChannelsNumberType(
    option: "followed-only" | "favorited-only" | "followed-and-favorited"
  ) {
    badgeLiveChannelsNumberType.value = option;
    setStorageItem({ badgeLiveChannelsNumberType: option });
  }

  function setNotificationChannelsType(
    option: "followed-only" | "favorited-only" | "followed-and-favorited"
  ) {
    notificationChannelsType.value = option;
    setStorageItem({ notificationChannelsType: option });
  }

  return {
    twitchData,
    twitchAccessToken,
    twitchAuthStatus,
    isLoggedIn,
    authLink,
    isDesktopNotificationsEnabled,
    isNotificationSilent,
    defaultPage,
    badgeLiveChannelsNumberType,
    notificationChannelsType,
    authenticateTwitch,
    sendChromeMessage,
    setStorageItem,
    getStorageItem,
    setTwitchData,
    logoutTwitch,
    toggleDesktopNotifications,
    toggleSilentNotifications,
    setDefaultPage,
    setbadgeLiveChannelsNumberType,
    setNotificationChannelsType
  };
});
