import axios, { type AxiosRequestConfig } from "axios";
import { useMainStore } from "../stores/main";

export function useApi() {
  const client = axios.create({
    baseURL: import.meta.env.VITE_TWITCH_API_URL
  });

  async function callApi<T = unknown>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    options: AxiosRequestConfig = {}
  ) {
    const mainStore = useMainStore();
    const response = await client.request<T>({
      url,
      method,
      ...options,
      headers: {
        Authorization: "Bearer " + mainStore.twitchAccessToken,
        "Client-Id": import.meta.env.VITE_TWITCH_CLIENT_ID,
        ...options.headers
      }
    });

    return response.data;
  }

  return callApi;
}
