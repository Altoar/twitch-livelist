import axios, { AxiosRequestConfig } from "axios";
import { useMainStore } from "../stores/main";

export function useApi() {
  const mainStore = useMainStore();
  const client = axios.create({
    baseURL: import.meta.env.VITE_TWITCH_API_URL
  });

  async function callApi<T = unknown>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    options: AxiosRequestConfig = {}
  ) {
    const response = await client.request<T>({
      url,
      method,
      ...options,
      headers: {
        Authorization: "Bearer " + mainStore.twitchAccessToken,
        ...options.headers
      }
    });

    return response.data;
  }

  return callApi;
}
