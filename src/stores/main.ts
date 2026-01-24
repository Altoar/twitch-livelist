import { ref, computed } from "vue";
import { defineStore } from "pinia";

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

  function authenticateTwitch(token: string) {
    twitchAccessToken.value = token;

    // Send access token to service worker where it will be stored in chrome storage
    sendChromeMessage({
      type: "SET_TWITCH_ACCESSTOKEN",
      data: { token: token }
    });
  }

  function logoutTwitch() {
    twitchAccessToken.value = "";
    twitchData.value = null;

    // Clear access token from chrome storage
    setChromeStorage({ twitchAccessToken: "" });
    setChromeStorage({ twitchData: null });
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

  function setChromeStorage(data: { [key: string]: any }) {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set(data).then(() => {
        console.log("Data saved to chrome storage:", data);
      });
    } else {
      console.warn(
        "Not running in a Chrome extension environment. Could not save to chrome storage."
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
    setChromeStorage,
    setTwitchData,
    logoutTwitch
  };
});
