import { useContext } from "react";
import { AuthContext } from "../components/AuthContext";

export function useApi() {

  const { credentials, logout } = useContext(AuthContext);

  const apiFetch = async (url, options = {}) => {

    if (!credentials) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: credentials,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(await response.text());
    }

    // 👉 Si pas de contenu (204, DELETE etc)
    if (response.status === 204) {
      return {};
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return {};
  };

  return { apiFetch };
}