async function validateToken(token) {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `OAuth ${token}`
    }
  });

  // If invalid, Twitch returns 401
  if (response.status === 401) {
    console.warn("Twitch token is invalid");
    await chrome.storage.sync.set({
      twitchData: null
    });
    return false;
  }

  const data = await response.json();

  await chrome.storage.sync.set({
    twitchData: {
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
    console.error("Failed to fetch Twitch user data");
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

chrome.runtime.onMessageExternal.addListener(async function (request) {
  console.log("Message received", request);
  if (request.type === "SET_TWITCH_ACCESSTOKEN") {
    const isTokenValid = await validateToken(request.data.token);

    if (!isTokenValid) {
      console.error("Received invalid Twitch token");
      return;
    }

    await chrome.storage.sync.set({ twitchAccessToken: request.data.token });
    await getTwitchUser(request.data.token);

    console.log("User data fetched and stored");
  }
});
