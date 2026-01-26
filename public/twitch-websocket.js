class TwitchWebSocket {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    this.ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    this.ws.onopen = () => {
      console.log("Connected to Twitch EventSub");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = (event) => {
      console.log("Disconnected from Twitch EventSub");
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, 1000 * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  handleMessage(message) {
    const { metadata, payload } = message;
    console.log("Twitch EventSub Message:", message);

    switch (metadata.message_type) {
      case "session_welcome":
        this.sessionId = payload.session.id;
        console.log("Session ID:", this.sessionId);
        // Subscribe to stream.online events here
        break;

      case "notification":
        if (metadata.subscription_type === "stream.online") {
          this.handleStreamOnline(payload.event);
        }
        break;

      case "session_keepalive":
        // Keep connection alive
        break;

      default:
        console.log("Unknown message type:", metadata.message_type);
    }
  }

  handleStreamOnline(event) {
    console.log("Channel went live:", {
      broadcaster: event.broadcaster_user_name,
      title: event.title,
      category: event.category_name,
      startedAt: event.started_at
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage
export const twitchWS = new TwitchWebSocket();
export function setupTwitchEventSubWebSocket() {
  twitchWS.connect();
}
