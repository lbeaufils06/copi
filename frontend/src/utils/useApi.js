export const useApi = () => {

  const apiFetch = async (url, options = {}) => {

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (response.status === 401) {
      window.location.href = "/";
      return;
    }

    if (!response.ok) {
      throw new Error("API error");
    }

    return response;
  };

  return { apiFetch };
};