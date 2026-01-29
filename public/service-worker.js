let allLiveChannelsDetails = {};

async function createInterval() {
  // If an alarm already exists, do not create a new one
  const alarmExists = await chrome.alarms.get("fetch-followed-live-channels");

  if (alarmExists) {
    return;
  }

  console.log("Creating alarm to fetch followed live channels every minute");

  chrome.alarms.create("fetch-followed-live-channels", {
    periodInMinutes: 1
  });

  chrome.alarms.create("validate-twitch-token", {
    periodInMinutes: 60
  });
}

function resetData() {
  chrome.storage.sync.remove("twitchData");
  chrome.storage.session.remove("followedLiveChannels");
  chrome.storage.sync.remove("twitchAccessToken");
  chrome.alarms.clear("fetch-followed-live-channels");
  chrome.alarms.clear("validate-twitch-token");
  chrome.action.setBadgeText({ text: "" });
}

async function init() {
  chrome.action.setBadgeBackgroundColor({ color: "#9146ff" }, () => {});
  chrome.action.setBadgeTextColor({ color: "#ffffff" }, () => {});

  const isValid = await validateToken();

  if (isValid) {
    getFollowedLiveChannels();
    await createInterval();
    console.log("Service worker started and interval created");
  }
}

async function validateToken() {
  const twitchAccessToken = await chrome.storage.sync.get([
    "twitchAccessToken"
  ]);

  if (!twitchAccessToken.twitchAccessToken) {
    console.warn("No Twitch access token found for validation");
    return false;
  }

  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `OAuth ${twitchAccessToken.twitchAccessToken}`
    }
  });

  // If invalid, Twitch returns 401
  if (response.status === 401) {
    console.warn("Twitch token is invalid");

    resetData();

    return false;
  }

  const data = await response.json();
  console.log("Twitch token is valid, data:", data);

  // Check if follows scope is present
  if (!data.scopes.includes("user:read:follows")) {
    console.warn("Twitch token does not have required scopes");
    resetData();
    return false;
  }

  const existingTwitchData = await chrome.storage.sync.get(["twitchData"]);

  await chrome.storage.sync.set({
    twitchData: {
      ...existingTwitchData.twitchData,
      clientId: data.client_id,
      scopes: data.scopes,
      expiresIn: data.expires_in
    }
  });

  return true;
}

async function getTwitchUser(token) {
  const twitchData = await chrome.storage.sync.get(["twitchData"]);
  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": twitchData.twitchData.clientId
    }
  });

  if (!response.ok) {
    console.warn("Failed to fetch Twitch user data");
    resetData();
    return;
  }

  const data = await response.json();

  await chrome.storage.sync.set({
    twitchData: {
      ...twitchData.twitchData,
      user: {
        id: data.data[0].id,
        login: data.data[0].login,
        displayName: data.data[0].display_name,
        email: data.data[0].email,
        type: data.data[0].type,
        broadcasterType: data.data[0].broadcaster_type,
        description: data.data[0].description,
        profileImageUrl: data.data[0].profile_image_url,
        offlineImageUrl: data.data[0].offline_image_url,
        createdAt: data.data[0].created_at
      }
    }
  });
  return data;
}

async function getFollowedLiveChannels() {
  const twitchAccessToken = await chrome.storage.sync.get([
    "twitchAccessToken"
  ]);

  const twitchData = await chrome.storage.sync.get(["twitchData"]);

  if (
    !twitchData.twitchData?.user?.id ||
    !twitchAccessToken.twitchAccessToken
  ) {
    console.warn("Twitch data or access token not found");
    resetData();
    return;
  }

  console.log("Fetching followed live channels...");
  let cursor = null;
  let allLiveChannelsIds = [];
  allLiveChannelsDetails = {};

  do {
    const url = new URL("https://api.twitch.tv/helix/streams/followed");
    url.searchParams.append("first", "100");
    url.searchParams.append("user_id", twitchData.twitchData.user.id);

    if (cursor) {
      url.searchParams.append("after", cursor);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${twitchAccessToken.twitchAccessToken}`,
        "Client-Id": twitchData.twitchData.clientId
      }
    });

    if (!response.ok) {
      console.warn("Failed to fetch followed live channels", response.error);

      // If status code is 401, token is invalid
      if (response.status === 401) {
        console.warn("Twitch token is invalid during fetch");
        resetData();
        return;
      }
      return;
    }

    const data = await response.json();

    // An array of user IDs of live followed channels
    allLiveChannelsIds = allLiveChannelsIds.concat(
      data.data.map((channel) => channel.user_id)
    );

    // Store detailed info about live followed channels in a global variable
    data.data.forEach((channel) => {
      allLiveChannelsDetails[channel.user_id] = channel;
    });

    cursor = data.pagination.cursor;
  } while (cursor);

  const numberOfLiveChannels = allLiveChannelsIds.length;
  chrome.action.setBadgeText({ text: numberOfLiveChannels.toString() });

  // Store the list of live followed channel IDs in session storage
  await chrome.storage.session.set({
    followedLiveChannels: allLiveChannelsIds
  });
}

// Get Twitch Access Token from external authentication webpage
chrome.runtime.onMessageExternal.addListener(async function (request) {
  if (request.type === "SET_TWITCH_ACCESSTOKEN") {
    await chrome.storage.sync.set({ twitchAccessToken: request.data.token });

    const isTokenValid = await validateToken();

    if (!isTokenValid) {
      console.error("Received invalid Twitch token");
      return;
    }

    await getTwitchUser(request.data.token);

    // Wait for user data to be stored before fetching followed channels
    getFollowedLiveChannels();
    createInterval();

    console.log("User data fetched and stored");
  }
});

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  // When Access Token has been removed, reset all data
  if (changes.twitchAccessToken?.newValue === "") {
    console.log("Twitch Access Token removed, resetting data");
    resetData();
    return;
  }

  // Get old and new values of "followedLiveChannels"
  if (changes.followedLiveChannels) {
    const oldChannels = changes.followedLiveChannels.oldValue || [];
    const newChannels = changes.followedLiveChannels.newValue || [];

    if (oldChannels.length === 0) {
      // Initial load, do not send notifications
      return;
    }

    // Check if desktop notifications are enabled
    const desktopNotifications = await chrome.storage.sync.get([
      "desktopNotifications"
    ]);

    if (!desktopNotifications.desktopNotifications) {
      return;
    }

    const disabledNotifications = await chrome.storage.sync.get([
      "disabledNotificationChannelIds"
    ]);

    const disabledChannelIds =
      disabledNotifications.disabledNotificationChannelIds || [];

    // Determine which channels went live (by comparing old and new lists) and are not disabled
    const wentLiveChannels = newChannels.filter(
      (channelId) =>
        !oldChannels.includes(channelId) &&
        !disabledChannelIds.includes(channelId)
    );

    if (wentLiveChannels.length === 0) {
      return;
    }

    const silentNotifications = await chrome.storage.sync.get([
      "silentNotifications"
    ]);

    // Default to true if silentNotifications doesn't exist
    const isSilent = silentNotifications.silentNotifications ?? true;

    console.log("Channels that went live:", wentLiveChannels);

    wentLiveChannels.forEach((channelId) => {
      console.log("Sending notification for channel ID:", channelId);
      const channelDetails = allLiveChannelsDetails[channelId];
      if (channelDetails) {
        const notificationOptions = {
          type: "basic",
          title: `${channelDetails.user_name} is now live!`,
          message: channelDetails.title,
          iconUrl: channelDetails.thumbnail_url
            .replace("{width}", "70")
            .replace("{height}", "70"),
          silent: isSilent
        };
        chrome.notifications.create(null, notificationOptions);
      }
    });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  init();
});

chrome.runtime.onInstalled.addListener(async () => {
  init();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "fetch-followed-live-channels") {
    getFollowedLiveChannels();
  }

  if (alarm.name === "validate-twitch-token") {
    validateToken();
  }
});
