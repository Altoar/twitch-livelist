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

  const isLoggedIn = computed(
    () => twitchData.value !== null && twitchData.value.user?.id
  );

  const authLink = computed(() => {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    const redirectUri = encodeURIComponent("http://localhost:5173/auth");
    const scope = ["user:read:email", "user:read:follows"].join("+");
    return `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  });

  async function authenticateTwitch(token: string) {
    twitchAccessToken.value = token;

    const twitchStore = useTwitchStore();

    if (typeof chrome !== "undefined" && chrome.storage) {
      // Send access token to service worker where it will be stored in chrome storage
      sendChromeMessage({
        type: "SET_TWITCH_ACCESSTOKEN",
        data: { token: token }
      });
    } else {
      const isValid = await twitchStore.validateToken();
      if (!isValid) {
        console.error("Invalid Twitch access token");
      } else {
        console.log("Twitch access token is valid");
        setStorageItem({ twitchAccessToken: token });
        await twitchStore.getTwitchUser();
      }
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
      console.log(
        "Not running in a Chrome extension environment. Could not send message."
      );
    }
  }

  function setStorageItem(data: { [key: string]: any }) {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set(data).then(() => {
        console.log("Data saved to chrome storage:", data);
      });
    } else if (typeof localStorage !== "undefined") {
      const key = Object.keys(data)[0] as string;
      const value = Object.values(data)[0];
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
      console.log("Data saved to localStorage:", data);
    } else {
      console.warn(
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

  function setTwitchData(data: TwitchData | null) {
    twitchData.value = data;
  }

  return {
    twitchData,
    twitchAccessToken,
    isLoggedIn,
    authLink,
    authenticateTwitch,
    sendChromeMessage,
    setStorageItem,
    getStorageItem,
    setTwitchData,
    logoutTwitch
  };
});
